const closed=['rejected','withdrawn','stopped'];
function checkBenefits(policy,applications,excludeId){
  const rules=policy.benefitRules||{};
  const relevant=applications.filter(a=>a.id!==excludeId&&!closed.includes(a.status)&&(!rules.period||!a.payload?.benefitPeriod||a.payload.benefitPeriod===rules.period));
  const existing=applications.find(a=>a.id!==excludeId&&a.policyId===policy.id&&!closed.includes(a.status)&&a.status!=='approved')||relevant.find(a=>a.policyId===policy.id)||null;
  const conflicts=relevant.filter(a=>a.policyId!==policy.id&&((rules.exclusiveWith||[]).includes(a.policyId)||(a.policy?.benefitRules?.exclusiveWith||[]).includes(policy.id))).map(a=>({id:a.id,policyId:a.policyId,title:a.policy?.title||a.policyId,status:a.status,blocksApplication:Boolean(rules.exclusiveApplication||a.policy?.benefitRules?.exclusiveApplication)}));
  return {period:rules.period||null,oncePerPeriod:rules.oncePerPeriod===true,stacking:rules.stacking||'unknown',source:rules.source||'尚未配置正式规则，需向办理部门核实',description:rules.description||'未配置叠加及重复享受规则，不能据此认定可重复领取。',exclusiveWith:rules.exclusiveWith||[],existing:existing?{id:existing.id,status:existing.status,channel:existing.policy?.channel||policy.channel}:null,conflicts,blocked:conflicts.some(a=>a.blocksApplication),externalVerified:false};
}
module.exports={checkBenefits};
