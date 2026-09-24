const { evaluatePolicy } = require('../../src/modules/policy-match/domain/matching');
const rule = (field, label, op, value, weight = 1, required = true) => ({ field, label, op, value, weight, required });
const personal = [rule('age','年龄18–35岁','between',[18,35],2), rule('education','本科及以上学历','in',['本科','硕士','博士'],2), rule('employment','已就业','equals','已就业'), rule('socialMonths','社保连续缴纳6个月','gte',6)];
const company = [rule('years','企业成立不超过5年','between',[0,5]), rule('taxStatus','纳税状态正常','equals','正常'), rule('rdRatio','研发投入占比不低于3%','gte',3,2)];
const material = (code, name) => ({ code, name, required: true, description: '仅支持 JPG、PNG 图片，单张不超过10MB' });
const definitions = [
  ['youth','青年人才成长支持计划','personal','人才','最高10万元',100000,'internal',personal],
  ['graduate','高校毕业生就业支持','personal','就业','最高3万元',30000,'external',[...personal.slice(0,2),rule('graduationYear','2024年及以后毕业','gte',2024)]],
  ['flexible','灵活就业社保补贴','personal','补贴','按月补贴',12000,'external',[rule('employment','灵活就业人员','equals','灵活就业'),rule('socialMonths','已缴纳社保','gte',1)]],
  ['startup','青年创业启动扶持','personal','创业','最高5万元',50000,'internal',[rule('startup','已创办企业','equals','是'),rule('startupYears','创业不超过3年','between',[0,3]),personal[0]]],
  ['skills','职业技能提升支持','personal','就业','最高3000元',3000,'internal',[rule('qualification','持有职业资格','equals','职业资格'),rule('socialMonths','社保缴纳12个月','gte',12)]],
  ['housing','青年人才安居支持','personal','人才','最高2万元',20000,'internal',personal.slice(0,2)],
  ['research','初创企业研发投入补助','company','科技创新','最高30万元',300000,'internal',company],
  ['hightech','高新技术企业成长支持','company','惠企','最高50万元',500000,'external',[rule('qualifications','有效高新技术企业资质','includes','高新技术企业'),company[1]]],
  ['jobs','企业稳岗扩岗支持','company','就业','每人1500元',15000,'internal',[rule('newJobs','新增就业人数不少于3人','gte',3),company[1]]],
  ['patent','知识产权成果转化支持','company','科技创新','最高20万元',200000,'internal',[rule('patents','有效知识产权不少于3项','gte',3),rule('projectStage','项目处于产业化阶段','equals','产业化')]],
  ['small','中小企业数字化扶持','company','惠企','最高15万元',150000,'external',[rule('employees','员工人数不超过300人','between',[1,300]),company[1]]],
  ['expired','上一年度创业补贴','company','创业','最高5万元',50000,'internal',company],
];
async function seedPolicyMatch(db) {
  for (const [id,title,subjectType,category,benefit,amount,channel,rules] of definitions) {
    const benefitRules={period:id==='expired'?'2025':'2026',oncePerPeriod:true,stacking:['youth','housing'].includes(id)?'exclusive':'unknown',exclusiveWith:id==='youth'?['housing']:id==='housing'?['youth']:[],exclusiveApplication:['youth','housing'].includes(id),source:'通用演示政策库：重复享受规则示例（非真实政策规定）',description:['youth','housing'].includes(id)?'演示规则：本年度仅可申报一次；青年人才成长支持与青年人才安居支持二选一，不可同时申报或重复享受。':'演示规则：本年度仅可申报一次；与其他政策能否叠加未配置，办理前需核实。'};
    const existing=await db.policyDefinition.findUnique({where:{id},select:{benefitRules:true}});
    await db.policyDefinition.upsert({ where:{id}, update:{}, create:{
      id,title,subjectType,category,benefit,amount,channel,rules,benefitRules,
      endsAt:new Date(id === 'expired' ? '2025-12-31T15:59:59Z' : '2026-12-31T15:59:59Z'),
      description:'本政策为通用体验数据，面向符合条件的申请主体，支持就业创业、人才成长及创新发展。支持标准仅用于功能演示，具体资格和办理要求以实际发布政策为准。',
      materials:subjectType === 'personal' ? [material('identity','身份证明'),material('employment','就业证明'),material('education','学历证明')] : [material('license','营业执照'),material('financial','经营情况证明'),material('project','项目说明')],
    } });
    if(existing&&!Object.keys(existing.benefitRules||{}).length)await db.policyDefinition.update({where:{id},data:{benefitRules}});
  }
  const userId='test-parent-001';
  const payload={age:28,region:'通用地区',residence:'本地户籍',education:'本科',graduationYear:2024,qualification:'职业资格',employment:'已就业',industry:'信息技术',socialMonths:12,startup:'否',startupYears:0};
  await db.policyMatchProfile.upsert({where:{userId_subjectType:{userId,subjectType:'personal'}},update:{},create:{userId,subjectType:'personal',payload}});
  const snapshotId='e730f405-566a-41f2-a137-c83acf2b1851';
  const policies=await db.policyDefinition.findMany({where:{subjectType:'personal'}});
  await db.policyMatchSnapshot.upsert({where:{id:snapshotId},update:{},create:{id:snapshotId,userId,subjectType:'personal',profile:payload,results:policies.map(p=>({...p,endsAt:p.endsAt.toISOString(),...evaluatePolicy(payload,p)}))}});
  await db.policyApplication.upsert({where:{id:'e730f405-566a-41f2-a137-c83acf2b1852'},update:{},create:{id:'e730f405-566a-41f2-a137-c83acf2b1852',userId,subjectType:'personal',policyId:'youth',policyVersion:1,status:'draft',payload:{applicant:'王芳',phone:'',purpose:'申请人才成长支持'},events:[{status:'draft',note:'演示草稿已创建',at:new Date().toISOString()}]}});
  const categoryId='550e8400-e29b-41d4-a716-446655440008';
  await db.category.upsert({where:{id:categoryId},update:{},create:{id:categoryId,name:'智能服务',sort:7}});
  const data={name:'政策智能匹配',description:'个人与企业画像、可解释政策匹配及申报办理',icon:'Zap',path:'/policy-match',status:'active',categoryId,sort:7};
  await db.app.upsert({where:{id:'550e8400-e29b-41d4-a716-446655440155'},update:{},create:{id:'550e8400-e29b-41d4-a716-446655440155',...data}});
}
module.exports={seedPolicyMatch};
