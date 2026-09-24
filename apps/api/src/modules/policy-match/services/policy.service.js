const db=require('../db');
const {NotFoundError}=require('../../../common/utils/error');
exports.list=(subjectType)=>db.policyDefinition.findMany({where:subjectType?{subjectType}:undefined,orderBy:{amount:'desc'}});
exports.detail=async(id)=>{ const row=await db.policyDefinition.findUnique({where:{id}}); if(!row)throw new NotFoundError('政策不存在');return row; };
exports.favorites=(userId)=>db.policyFavorite.findMany({where:{userId},include:{policy:true},orderBy:{createdAt:'desc'}});
exports.favorite=async(userId,policyId,enabled)=>{
  await exports.detail(policyId);
  if(enabled) await db.policyFavorite.upsert({where:{userId_policyId:{userId,policyId}},update:{},create:{userId,policyId}});
  else await db.policyFavorite.deleteMany({where:{userId,policyId}});
  return {saved:enabled};
};
