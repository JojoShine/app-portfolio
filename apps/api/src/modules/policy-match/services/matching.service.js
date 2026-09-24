const db=require('../db');
const {evaluatePolicy}=require('../domain/matching');
const benefits=require('./benefit.service');
const {ValidationError,NotFoundError}=require('../../../common/utils/error');
exports.create=async(userId,subjectType)=>{
  const profile=await db.policyMatchProfile.findUnique({where:{userId_subjectType:{userId,subjectType}}});
  if(!profile || !Object.values(profile.payload).some(v=>v!==null&&v!==''))throw new ValidationError('请先填写画像');
  const policies=await db.policyDefinition.findMany({where:{subjectType,active:true}});
  const results=policies.map(p=>({...p,endsAt:p.endsAt.toISOString(),...evaluatePolicy(profile.payload,p)})).sort((a,b)=>b.score-a.score);
  return db.policyMatchSnapshot.create({data:{userId,subjectType,profile:profile.payload,results}});
};
exports.list=(userId,subjectType)=>db.policyMatchSnapshot.findMany({where:{userId,subjectType},orderBy:{createdAt:'desc'},take:30});
exports.detail=async(userId,id)=>{const row=await db.policyMatchSnapshot.findFirst({where:{id,userId}});if(!row)throw new NotFoundError('匹配记录不存在');const policies=await db.policyDefinition.findMany({where:{id:{in:row.results.map(p=>p.id)}}});return {...row,benefitChecks:await benefits.checks(userId,policies)};};
