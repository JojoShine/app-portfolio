const db = require('../db');
const { decrypt, digest } = require('../utils/crypto');
const { getActiveSeason, serializeSchool } = require('./enrollment.shared');
const { getContents } = require('./portal.service');
const { NotFoundError } = require('../../../common/utils/error');

exports.profile = async (userId) => {
  const record = await db.enrollmentProfile.findUnique({ where: { userId } });
  return decrypt(record?.payloadEncrypted, {});
};
exports.contacts = async () => (await getContents({ type: 'contact' })).map((row) => ({
  id: row.stage || row.id, label: row.content.label || row.title,
  number: row.content.number, dial: row.content.dial, hours: row.content.hours,
}));
exports.districts = async ({ keyword, regionId }) => {
  const season = await getActiveSeason();
  const regions = await db.enrollmentDistrict.findMany({ where: { seasonId: season.id, active: true }, orderBy: { sort: 'asc' }, select: { id: true, name: true, description: true } });
  if (regionId && !regions.some((region) => region.id === regionId)) throw new NotFoundError('学区不存在');
  const where = { seasonId: season.id, active: true };
  if (regionId) where.districts = { some: { districtId: regionId } };
  if (keyword) where.OR = [{ scopeSummary: { contains: keyword, mode: 'insensitive' } }, { address: { contains: keyword, mode: 'insensitive' } }];
  const schools = regionId || keyword ? await db.enrollmentSchool.findMany({ where, orderBy: { sort: 'asc' } }) : [];
  return { keyword, regions, schools: schools.map(serializeSchool), notice: '查询结果仅供参考，请以当年招生政策和学校审核为准。' };
};
exports.propertyDegree = async ({ type, keyword }) => {
  const record = await db.enrollmentPropertyDegree.findFirst({ where: { active: true, ...(type === 'address' ? { address: keyword } : { certificateHash: digest(keyword) }) } });
  const degree = record ? {
    status: record.status, label: record.status === 'occupied' ? '学位已占用' : '学位未占用',
    ...(record.status === 'occupied' ? { year: record.year ? `${record.year}年` : '', stage: ({ kindergarten: '幼儿园学段', primary: '小学学段', middle: '初中学段' })[record.stage] || '' } : {}),
  } : { status: 'unknown', label: '暂未查到学位信息' };
  return { queryType: type, queryValue: keyword, degree, notice: '查询结果仅反映当前系统记录，未查到不代表未占用，最终以教育主管部门核验结果为准。' };
};
