const { ValidationError } = require('../../../common/utils/error');
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const categories = ['设施损坏', '垃圾堆放', '道路积水', '占道', '其他'];
const severities = ['轻微', '一般', '严重'];
const text = (value, name, max, optional = false) => {
  if (optional && (value === undefined || value === '')) return '';
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw new ValidationError(`请填写${name}（最多${max}字）`);
  return value.trim();
};
const uuid = (value) => {
  if (typeof value !== 'string' || !UUID.test(value)) throw new ValidationError('无效的记录标识');
  return value;
};
const photos = (data = {}) => {
  if (!Array.isArray(data.fileIds) || data.fileIds.length < 1 || data.fileIds.length > 6) throw new ValidationError('请上传1至6张照片');
  const fileIds = data.fileIds.map(uuid);
  if (new Set(fileIds).size !== fileIds.length) throw new ValidationError('照片不能重复');
  return { fileIds };
};
const coordinates = (data = {}) => {
  const longitude = Number(data.longitude), latitude = Number(data.latitude);
  if (data.longitude == null || data.latitude == null || !Number.isFinite(longitude) || !Number.isFinite(latitude) || longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) throw new ValidationError('定位坐标无效');
  return { longitude, latitude, gps: data.gps === true || data.gps === 'true' };
};
const report = (data = {}) => {
  const { fileIds } = photos(data);
  const object = text(data.object, '物品或对象', 80);
  const description = text(data.description, '问题描述', 1000);
  if (!categories.includes(data.category) || !severities.includes(data.severity)) throw new ValidationError('请确认问题类别和程度');
  const address = text(data.address, '发生地址', 300);
  if (data.locationConfirmed !== true) throw new ValidationError('请确认问题实际发生位置');
  const location = data.longitude == null && data.latitude == null ? {} : coordinates(data);
  return { fileIds, requestId: uuid(data.requestId), analysisId: data.analysisId ? uuid(data.analysisId) : null,
    content: { object, category: data.category, severity: data.severity, description, address,
      detail: text(data.detail, '补充位置', 200, true), reason: text(data.reason, '判断依据', 300, true),
      locationConfirmed: true, ...location } };
};
const analysisResult = (data) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new ValidationError('识别结果格式错误');
  return {
    object: typeof data.object === 'string' ? data.object.slice(0, 80) : '',
    category: categories.includes(data.category) ? data.category : '',
    severity: severities.includes(data.severity) ? data.severity : '',
    description: typeof data.description === 'string' ? data.description.slice(0, 1000) : '',
    reason: typeof data.reason === 'string' ? data.reason.slice(0, 300) : '',
    locationClue: typeof data.locationClue === 'string' ? data.locationClue.slice(0, 200) : '',
    needsConfirmation: data.needsConfirmation !== false,
    multipleIssues: data.multipleIssues === true,
  };
};
module.exports = { uuid, photos, report, coordinates, analysisResult, categories, severities,
  search: (data) => ({ q: text(data.q, '搜索地址', 100) }),
  page: (data) => {
    const page = Number(data.page || 1);
    if (!Number.isInteger(page) || page < 1 || page > 10000) throw new ValidationError('页码无效');
    return { page };
  },
};
