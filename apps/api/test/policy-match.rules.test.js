const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluatePolicy } = require('../src/modules/policy-match/domain/matching');
const policy = { active: true, subjectType: 'personal', endsAt: '2099-12-31', rules: [
  { field: 'age', label: '年龄18–35岁', op: 'between', value: [18, 35], required: true, weight: 2 },
  { field: 'education', label: '本科及以上', op: 'in', value: ['本科', '硕士', '博士'], required: true, weight: 1 },
] };
test('硬性条件优先于分数，空值不能视为零', () => {
  assert.equal(evaluatePolicy({ age: 42, education: '本科' }, policy).eligibility, 'ineligible');
  const result = evaluatePolicy({ age: null, education: '本科' }, policy);
  assert.equal(result.eligibility, 'potential');
  assert.equal(result.explanations[0].status, 'missing');
});
test('边界包含、身份隔离、过期与稳定解释', () => {
  const result = evaluatePolicy({ age: 35, education: '本科' }, policy);
  assert.equal(result.eligibility, 'eligible');
  assert.equal(result.score, 100);
  assert.equal(evaluatePolicy({ age: 36, education: '本科' }, policy).eligibility, 'ineligible');
  assert.equal(evaluatePolicy({}, { ...policy, endsAt: '2020-01-01' }).eligibility, 'expired');
  assert.equal(result.explanations[0].actual, 35);
});
