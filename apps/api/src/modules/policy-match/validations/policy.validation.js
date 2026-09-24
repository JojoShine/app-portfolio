const { ValidationError } = require('../../../common/utils/error');
const fail = (text) => { throw new ValidationError(text); };
const fields = {
  personal: { age: 'number', region: 'text', residence: ['本地户籍','非本地户籍'], education: ['大专及以下','本科','硕士','博士'], graduationYear: 'number', qualification: ['职业资格','人才认定','暂未取得'], employment: ['已就业','待就业','灵活就业','在校'], industry: 'text', socialMonths: 'number', startup: ['是','否'], startupYears: 'number' },
  company: { name: 'text', region: 'text', industry: 'text', years: 'number', employees: 'number', revenue: 'number', taxStatus: ['正常','异常'], rdRatio: 'number', qualifications: 'array', patents: 'number', newJobs: 'number', projectStage: ['筹备','研发','产业化'], investment: 'number' },
};
const subject = (value) => ['personal','company'].includes(value) ? value : fail('请选择个人或企业身份');
const string = (value, max = 200) => typeof value === 'string' && value.trim().length <= max ? value.trim() : fail('文字输入不合法');
const version = (value) => Number.isInteger(value) && value >= 0 ? value : fail('数据版本不合法');
const id = (value) => typeof value === 'string' && /^[\w-]{1,100}$/.test(value) ? value : fail('标识不合法');
const uuid = (value) => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value) ? value : fail('记录标识不合法');
function profile(body, type) {
  if (!body?.payload || typeof body.payload !== 'object' || Array.isArray(body.payload)) fail('画像格式不合法');
  const payload = {};
  for (const [key, value] of Object.entries(body.payload)) {
    const rule = fields[type][key];
    if (!rule) fail('画像包含未知字段');
    if (value === null || value === '') { payload[key] = null; continue; }
    if (rule === 'number') {
      if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100000000) fail('请输入有效数字');
      if ((key === 'age' && value > 120) || (key === 'rdRatio' && value > 100)) fail('数值超出范围');
      payload[key] = value;
    } else if (rule === 'array') {
      if (!Array.isArray(value) || value.length > 5 || value.some((v) => !['高新技术企业','科技型中小企业','专精特新企业'].includes(v))) fail('资质不合法');
      payload[key] = [...new Set(value)];
    } else if (Array.isArray(rule)) {
      if (!rule.includes(value)) fail('选项不合法');
      payload[key] = value;
    } else payload[key] = string(value);
  }
  return { payload, version: version(body.version) };
}
function application(body) {
  const payload = {};
  if(body.payload?.benefitDeclaration!==undefined)payload.benefitDeclaration=benefitDeclaration(body.payload.benefitDeclaration);
  for (const key of ['applicant','phone','purpose']) if (body.payload?.[key] !== undefined) payload[key] = string(body.payload[key], key === 'purpose' ? 2000 : 100);
  return { payload, version: version(body.version) };
}
function progress(body) {
  if (!['preparing','visited_external','stopped'].includes(body.status)) fail('外部办理状态不合法');
  if (!Array.isArray(body.prepared) || body.prepared.length > 20) fail('材料清单不合法');
  return { status: body.status, prepared: body.prepared.map(id), version: version(body.version) };
}
function benefitDeclaration(value){return value===undefined?'unknown':['none','received','unknown'].includes(value)?value:fail('享受情况选项不合法');}
module.exports = { fields, subject, string, version, id, uuid, profile, application, progress, benefitDeclaration };
