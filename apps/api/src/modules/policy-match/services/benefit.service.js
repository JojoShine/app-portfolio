const db=require('../db');
const {checkBenefits}=require('../domain/benefits');
const {ConflictError,ValidationError,NotFoundError}=require('../../../common/utils/error');
async function checks(userId,policies,client=db,excludeId){
  const applications=await client.policyApplication.findMany({where:{userId,subjectType:{in:[...new Set(policies.map(p=>p.subjectType))]}},include:{policy:true},orderBy:{updatedAt:'desc'}});
  return Object.fromEntries(policies.map(p=>[p.id,checkBenefits(p,applications,excludeId)]));
}
async function get(userId,policyId){
  const policy=await db.policyDefinition.findUnique({where:{id:policyId}});
  if(!policy)throw new NotFoundError('政策不存在');
  const result=(await checks(userId,[policy]))[policyId];
  const peers=await db.policyDefinition.findMany({where:{id:{in:result.exclusiveWith}},select:{id:true,title:true}});
  return {...result,exclusivePolicies:peers};
}
function assertAllowed(check,declaration){
  if(check.blocked)throw new ConflictError('存在同周期互斥政策办理记录，请先查看已有记录并核实，勿重复填报');
  if(declaration!=='none')throw new ValidationError(declaration==='received'?'你已声明享受过相关支持，请先核实重复享受或补差额规则':'请先核实并确认本周期未享受本政策或互斥政策；查不到记录不代表未享受');
}
module.exports={checks,get,assertAllowed};
