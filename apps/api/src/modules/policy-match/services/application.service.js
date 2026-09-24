const {randomUUID}=require('node:crypto');
const db=require('../db');
const {evaluatePolicy}=require('../domain/matching');
const benefits=require('./benefit.service');
const {NotFoundError,ConflictError,ValidationError}=require('../../../common/utils/error');
const include={policy:true,materials:{include:{file:{select:{id:true,originalName:true,size:true,mimeType:true}}}}};
const event=(status,note)=>({status,note,at:new Date().toISOString()});
const owned=async(tx,userId,id)=>{const row=await tx.policyApplication.findFirst({where:{id,userId},include});if(!row)throw new NotFoundError('申请不存在');return row;};
exports.detail=(userId,id)=>owned(db,userId,id);
exports.list=(userId,subjectType)=>db.policyApplication.findMany({where:{userId,subjectType},include,orderBy:{updatedAt:'desc'},take:100});
exports.create=(userId,policyId,declaration)=>db.$transaction(async tx=>{
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;
  const policy=await tx.policyDefinition.findUnique({where:{id:policyId}});
  if(!policy)throw new NotFoundError('政策不存在');
  const check=(await benefits.checks(userId,[policy],tx))[policyId];
  if(check.existing)return owned(tx,userId,check.existing.id);
  if(!policy.active||policy.endsAt<=new Date())throw new ConflictError('政策已截止或下架');
  benefits.assertAllowed(check,declaration);
  const profile=await tx.policyMatchProfile.findUnique({where:{userId_subjectType:{userId,subjectType:policy.subjectType}}});
  if(!profile)throw new ValidationError('请先完善对应身份画像');
  if(evaluatePolicy(profile.payload,policy).eligibility==='ineligible')throw new ConflictError('当前画像不满足硬性申报条件');
  const status=policy.channel==='internal'?'draft':'preparing';
  return tx.policyApplication.create({data:{userId,policyId,subjectType:policy.subjectType,policyVersion:policy.version,status,payload:{benefitPeriod:check.period,benefitDeclaration:declaration,benefitRules:policy.benefitRules},events:[event(status,'已创建办理记录；享受情况由用户声明，未核验外部领取记录')]},include});
});
async function update(tx,row,version,data){
  const changed=await tx.policyApplication.updateMany({where:{id:row.id,userId:row.userId,version},data:{...data,version:{increment:1}}});
  if(!changed.count)throw new ConflictError('申请已更新，请刷新后继续');
}
exports.save=(userId,id,input)=>db.$transaction(async tx=>{
  const row=await owned(tx,userId,id);
  const externalDeclaration=row.policy.channel==='external'&&['preparing','visited_external'].includes(row.status)&&Object.keys(input.payload).every(key=>key==='benefitDeclaration');
  if(!externalDeclaration&&(row.policy.channel!=='internal'||!['draft','supplement_required'].includes(row.status)))throw new ConflictError('当前申请不可编辑');
  await update(tx,row,input.version,{payload:{...row.payload,...input.payload}});
  return owned(tx,userId,id);
});
exports.withdraw=(userId,id,input)=>db.$transaction(async tx=>{
  const row=await owned(tx,userId,id);
  if(row.policy.channel!=='internal'||row.status!=='draft')throw new ConflictError('仅未提交的草稿可以撤回');
  await update(tx,row,input.version,{status:'withdrawn',events:[...row.events,event('withdrawn','用户撤回草稿，可重新发起申请')]});
  return owned(tx,userId,id);
});
exports.material=(userId,id,input)=>db.$transaction(async tx=>{
  const row=await owned(tx,userId,id);
  if(row.policy.channel!=='internal'||!['draft','supplement_required'].includes(row.status))throw new ConflictError('当前状态不能上传材料');
  if(!row.policy.materials.some(m=>m.code===input.code))throw new ValidationError('材料项目不存在');
  const file=await tx.file.findFirst({where:{id:input.fileId,uploadedBy:userId,isPublic:false}});
  if(!file||!['image/jpeg','image/png'].includes(file.mimeType)||file.size>10*1024*1024)throw new ValidationError('请上传10MB以内的JPG或PNG图片');
  await update(tx,row,input.version,{});
  await tx.policyApplicationMaterial.upsert({where:{applicationId_code:{applicationId:id,code:input.code}},update:{fileId:file.id},create:{applicationId:id,code:input.code,fileId:file.id}});
  return owned(tx,userId,id);
});
exports.submit=(userId,id,input)=>db.$transaction(async tx=>{
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;
  const row=await owned(tx,userId,id);
  if(row.submissionKey===input.key&&row.receipt)return row;
  if(row.policy.channel!=='internal'||!['draft','supplement_required'].includes(row.status))throw new ConflictError('申请已提交或不可提交');
  if(!row.policy.active||row.policy.endsAt<=new Date())throw new ConflictError('政策已截止');
  if(row.policyVersion!==row.policy.version)throw new ConflictError('政策规则已更新，请重新创建申请');
  const check=(await benefits.checks(userId,[row.policy],tx,id))[row.policyId];
  if(check.existing)throw new ConflictError('本周期已有同政策办理记录，请勿重复提交');
  benefits.assertAllowed(check,row.payload.benefitDeclaration);
  const profile=await tx.policyMatchProfile.findUnique({where:{userId_subjectType:{userId,subjectType:row.subjectType}}});
  if(!profile||evaluatePolicy(profile.payload,row.policy).eligibility!=='eligible')throw new ValidationError('请完善画像并满足全部资格条件后提交');
  if(!row.payload.applicant||!/^1\d{10}$/.test(row.payload.phone||''))throw new ValidationError('请填写申请人及有效手机号');
  if(row.policy.materials.some(m=>m.required&&!row.materials.some(f=>f.code===m.code)))throw new ValidationError('请上传全部必需材料');
  if(row.materials.some(m=>!['image/jpeg','image/png'].includes(m.file.mimeType)||m.file.size>10*1024*1024))throw new ValidationError('申报材料仅支持10MB以内的JPG或PNG图片，请替换不符合要求的材料');
  await update(tx,row,input.version,{status:'submitted',submissionKey:input.key,receipt:row.receipt||'DEMO-'+randomUUID().slice(0,8).toUpperCase(),payload:{...row.payload,submittedProfile:profile.payload,submittedPolicy:JSON.parse(JSON.stringify(row.policy))},events:[...row.events,event('submitted','演示申请已提交，未接入真实政务平台')]});
  return owned(tx,userId,id);
});
exports.progress=(userId,id,input)=>db.$transaction(async tx=>{
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;
  const row=await owned(tx,userId,id);
  if(row.policy.channel!=='external'||row.status==='stopped')throw new ConflictError('当前记录不可更新外部进度');
  if(input.status==='visited_external'){
    const check=(await benefits.checks(userId,[row.policy],tx,id))[row.policyId];
    if(check.existing)throw new ConflictError('本周期已有同政策办理记录');
    benefits.assertAllowed(check,row.payload.benefitDeclaration);
  }
  if(input.prepared.some(code=>!row.policy.materials.some(m=>m.code===code)))throw new ValidationError('材料清单不合法');
  await update(tx,row,input.version,{status:input.status,prepared:input.prepared,events:row.status===input.status?row.events:[...row.events,event(input.status,'用户自行记录外部办理进度，不代表已受理')]});
  return owned(tx,userId,id);
});
