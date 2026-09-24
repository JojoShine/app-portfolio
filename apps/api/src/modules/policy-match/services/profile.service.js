const db = require('../db');
const { ConflictError } = require('../../../common/utils/error');
const { fields } = require('../validations/policy.validation');
const decorate = (row, subjectType) => {
  const count = Object.keys(fields[subjectType]).length;
  const filled = Object.values(row?.payload || {}).filter(v => v !== null && v !== '' && (!Array.isArray(v) || v.length)).length;
  return { ...row, subjectType, payload:row?.payload || {}, version:row?.version || 0, filled, count, completeness:Math.round(filled/count*100) };
};
exports.get = async(userId, subjectType) => decorate(await db.policyMatchProfile.findUnique({where:{userId_subjectType:{userId,subjectType}}}),subjectType);
exports.save = async(userId,subjectType,input) => {
  try {
    if (!input.version) return decorate(await db.policyMatchProfile.create({data:{userId,subjectType,payload:input.payload}}),subjectType);
    const result=await db.policyMatchProfile.updateMany({where:{userId,subjectType,version:input.version},data:{payload:input.payload,version:{increment:1}}});
    if(!result.count) throw new ConflictError('画像已更新，请刷新后重试');
    return exports.get(userId,subjectType);
  } catch(error) { if(error.code==='P2002') throw new ConflictError('画像已存在，请刷新后重试'); throw error; }
};
