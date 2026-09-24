const unknown = (value) => value === null || value === undefined || value === '' || value === '不确定';
function evaluatePolicy(profile, policy, now = new Date()) {
  const explanations = policy.rules.map((rule) => {
    const actual = profile[rule.field];
    let status = 'missing';
    if (!unknown(actual)) {
      const checks = {
        between: () => Number(actual) >= rule.value[0] && Number(actual) <= rule.value[1],
        gte: () => Number(actual) >= rule.value,
        in: () => rule.value.includes(actual),
        includes: () => Array.isArray(actual) && actual.includes(rule.value),
        equals: () => actual === rule.value,
      };
      status = checks[rule.op]?.() ? 'matched' : 'unmatched';
    }
    return { ...rule, actual: actual ?? null, status };
  });
  const total = explanations.reduce((sum, r) => sum + r.weight, 0);
  const score = total ? Math.round(explanations.filter((r) => r.status === 'matched').reduce((sum, r) => sum + r.weight, 0) / total * 100) : 0;
  let eligibility = explanations.some((r) => r.required && r.status === 'unmatched') ? 'ineligible'
    : explanations.some((r) => r.status === 'missing') ? 'potential' : 'eligible';
  if (!policy.active || new Date(policy.endsAt) <= now) eligibility = 'expired';
  return { score, eligibility, explanations };
}
module.exports = { evaluatePolicy };
