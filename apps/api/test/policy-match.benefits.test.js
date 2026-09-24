const test=require('node:test');
const assert=require('node:assert/strict');
const {checkBenefits}=require('../src/modules/policy-match/domain/benefits');
const policy={id:'a',benefitRules:{period:'2026',oncePerPeriod:true,stacking:'exclusive',exclusiveWith:['b'],exclusiveApplication:true,source:'演示规则'}};
const record=(id,status,period='2026')=>({id:'record-'+id,policyId:id,status,payload:{benefitPeriod:period},policy:{title:id,benefitRules:policy.benefitRules}});
test('同周期已通过审批记录复用，不误标已享受；撤回和上期记录不阻塞',()=>{
  assert.equal(checkBenefits(policy,[record('a','approved')]).existing.status,'approved');
  assert.equal(checkBenefits(policy,[record('a','withdrawn')]).existing,null);
  assert.equal(checkBenefits(policy,[record('a','approved','2025')]).existing,null);
});
test('互斥关系双向生效，同期在办阻止重复填报，不同周期不冲突',()=>{
  assert.equal(checkBenefits(policy,[record('b','submitted')]).blocked,true);
  assert.equal(checkBenefits(policy,[record('b','submitted','2025')]).blocked,false);
  const reverse={id:'b',benefitRules:{period:'2026',stacking:'unknown'}};
  const a=record('a','draft');a.policy.benefitRules={...policy.benefitRules,exclusiveWith:['b']};
  assert.equal(checkBenefits(reverse,[a]).blocked,true);
});
test('规则缺失不是可叠加，查不到领取记录也不能代表未享受',()=>{
  const result=checkBenefits({id:'a'},[]);
  assert.equal(result.stacking,'unknown');
  assert.equal(result.externalVerified,false);
  assert.equal(result.blocked,false);
});
