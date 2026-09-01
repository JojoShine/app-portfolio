const { ValidationError } = require('../../../common/utils/error');
const {
  STAGES,
  CATEGORIES,
  PUBLICATION_TYPES,
  VERIFICATION_TYPES,
} = require('../domain/constants');

const ensureObject = (value, field = '请求数据') => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ValidationError(`${field}格式不正确`);
  }
  return value;
};

const requiredText = (value, field, maxLength = 255) => {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) throw new ValidationError(`请填写${field}`);
  if (text.length > maxLength) throw new ValidationError(`${field}过长`);
  return text;
};

const optionalText = (value, field, maxLength = 255) => {
  if (value === undefined || value === null || value === '') return null;
  return requiredText(value, field, maxLength);
};

const enumValue = (value, allowed, field) => {
  if (!allowed.includes(value)) throw new ValidationError(`${field}不正确`);
  return value;
};

const uuid = (value, field) => {
  const text = requiredText(value, field, 50);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(text)) {
    throw new ValidationError(`${field}不正确`);
  }
  return text;
};

const version = (value) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) throw new ValidationError('报名版本不正确');
  return parsed;
};

const containsReservedKey = (value, reservedKey) => {
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) return value.some((item) => containsReservedKey(item, reservedKey));
  return Object.entries(value).some(([key, item]) => key === reservedKey || containsReservedKey(item, reservedKey));
};

const validateSchoolFilters = (query) => ({
  stage: query.stage ? enumValue(query.stage, STAGES, '学段') : undefined,
  category: query.category ? enumValue(query.category, CATEGORIES, '报名类别') : undefined,
  keyword: optionalText(query.keyword, '关键词', 80),
});

const validateCreateApplication = (body) => {
  ensureObject(body);
  const studentName = requiredText(body.studentName, '学生姓名', 80);
  const studentIdNumber = requiredText(body.studentIdNumber, '学生证件号码', 40).toUpperCase();
  if (!/^[0-9A-Z一-龥()-]{4,40}$/.test(studentIdNumber)) {
    throw new ValidationError('学生证件号码格式不正确');
  }
  return {
    schoolId: uuid(body.schoolId, '学校'),
    studentName,
    studentIdNumber,
  };
};

const validateDraftUpdate = (body) => {
  ensureObject(body);
  const data = ensureObject(body.data, '报名信息');
  if (containsReservedKey(data, 'departmentData')) {
    throw new ValidationError('共享部门数据只能通过核验接口修改');
  }
  const studentIdNumber = body.studentIdNumber
    ? requiredText(body.studentIdNumber, '学生证件号码', 40).toUpperCase()
    : null;
  if (studentIdNumber && !/^[0-9A-Z一-龥()-]{4,40}$/.test(studentIdNumber)) {
    throw new ValidationError('学生证件号码格式不正确');
  }
  const reasonInput = body.verificationModificationReasons || {};
  if (!reasonInput || typeof reasonInput !== 'object' || Array.isArray(reasonInput)) {
    throw new ValidationError('核验数据修改原因格式不正确');
  }
  const verificationModificationReasons = {};
  for (const [type, reason] of Object.entries(reasonInput)) {
    enumValue(type, VERIFICATION_TYPES, '核验数据类型');
    verificationModificationReasons[type] = requiredText(reason, '核验数据修改原因', 500);
  }
  return {
    expectedVersion: version(body.expectedVersion),
    data,
    studentName: optionalText(body.studentName, '学生姓名', 80),
    studentIdNumber,
    verificationModificationReasons,
  };
};

const validateSchoolChange = (body) => {
  ensureObject(body);
  return {
    expectedVersion: version(body.expectedVersion),
    schoolId: uuid(body.schoolId, '学校'),
  };
};

const validatePolicyConfirmation = (body) => {
  ensureObject(body);
  if (body.confirmed !== true) throw new ValidationError('请阅读并同意学校招生政策');
  return { policyVersion: requiredText(body.policyVersion, '政策版本', 50) };
};

const validateVerificationRequest = (body) => {
  ensureObject(body);
  if (body.authorized !== true) throw new ValidationError('请同意部门数据查询授权');
  const types = Array.isArray(body.types) && body.types.length
    ? [...new Set(body.types.map((type) => enumValue(type, VERIFICATION_TYPES, '查询类型')))]
    : null;
  const mockFailures = Array.isArray(body.mockFailures)
    ? body.mockFailures.filter((type) => VERIFICATION_TYPES.includes(type))
    : [];
  return {
    authorizationVersion: requiredText(body.authorizationVersion || 'v1', '授权文本版本', 50),
    types,
    mockFailures,
  };
};

const validateVerificationUpdate = (body) => {
  ensureObject(body);
  return {
    declaredData: ensureObject(body.declaredData, '申报数据'),
    modificationReason: optionalText(body.modificationReason, '修改原因', 500),
  };
};

const validateMaterial = (body) => {
  ensureObject(body);
  return {
    fileId: uuid(body.fileId, '文件'),
    itemCode: requiredText(body.itemCode, '材料项', 80),
    sort: Number.isInteger(Number(body.sort)) ? Math.max(0, Number(body.sort)) : 0,
  };
};

const validateMaterialOrder = (body) => {
  ensureObject(body);
  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 100) {
    throw new ValidationError('材料排序数据不正确');
  }
  return body.items.map((item, index) => ({
    id: uuid(item?.id, '材料'),
    sort: Number.isInteger(Number(item?.sort)) ? Math.max(0, Number(item.sort)) : index,
  }));
};

const validateSubmission = (body) => {
  ensureObject(body);
  if (body.truthConfirmed !== true) throw new ValidationError('请勾选信息真实性声明');
  return {
    expectedVersion: version(body.expectedVersion),
    declarationVersion: requiredText(body.declarationVersion || 'v1', '声明版本', 50),
    idempotencyKey: requiredText(body.idempotencyKey, '防重标识', 100),
  };
};

const validateReview = (body) => {
  ensureObject(body);
  const action = enumValue(body.action, ['return', 'approve', 'reject'], '审核操作');
  const reason = optionalText(body.reason, '审核意见', 1000);
  const fields = Array.isArray(body.fields)
    ? body.fields.map((field) => requiredText(field, '问题字段', 100)).slice(0, 50)
    : [];
  if (action === 'return' && (!reason || fields.length === 0)) {
    throw new ValidationError('退回修改需要选择问题项并填写原因');
  }
  if (action === 'reject' && !reason) throw new ValidationError('初审不通过需要填写原因');
  return { action, reason, fields };
};

const validateAdmission = (body) => {
  ensureObject(body);
  return { schoolName: requiredText(body.schoolName, '录取学校', 160) };
};

const validatePublication = (type, body) => {
  ensureObject(body);
  let arrangement = body.arrangement && typeof body.arrangement === 'object' && !Array.isArray(body.arrangement)
    ? body.arrangement
    : null;
  if (type === 'initial' && body.published === true) {
    if (!arrangement) throw new ValidationError('发布初审公示前请配置线下审核安排');
    const location = requiredText(arrangement.location, '线下审核地点', 500);
    const startsAt = new Date(arrangement.startsAt);
    const endsAt = new Date(arrangement.endsAt);
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) {
      throw new ValidationError('请填写正确的线下审核开始和结束时间');
    }
    arrangement = {
      ...arrangement,
      location,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    };
  }
  return {
    type: enumValue(type, PUBLICATION_TYPES, '公示类型'),
    published: body.published === true,
    arrangement,
  };
};

const validatePublicQuery = (body) => {
  ensureObject(body);
  const lastSix = requiredText(body.studentIdLastSix, '证件号码后六位', 6).toUpperCase();
  if (!/^[0-9A-Z]{6}$/.test(lastSix)) throw new ValidationError('请输入证件号码后六位');
  return {
    studentName: requiredText(body.studentName, '学生姓名', 80),
    studentIdLastSix: lastSix,
    captchaToken: requiredText(body.captchaToken, '验证码凭证', 1000),
    captchaCode: requiredText(body.captchaCode, '图形验证码', 10),
  };
};

module.exports = {
  validateSchoolFilters,
  validateCreateApplication,
  validateDraftUpdate,
  validateSchoolChange,
  validatePolicyConfirmation,
  validateVerificationRequest,
  validateVerificationUpdate,
  validateMaterial,
  validateMaterialOrder,
  validateSubmission,
  validateReview,
  validateAdmission,
  validatePublication,
  validatePublicQuery,
};
