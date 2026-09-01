const prisma = require('../db');
const { STATUS_LABELS } = require('../domain/constants');
const { encrypt, decrypt } = require('../utils/crypto');
const {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  ServiceUnavailableError,
} = require('../../../common/utils/error');

const EDITABLE_STATUSES = ['draft', 'returned'];

const withSerializableTransaction = async (work, options = {}) => {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await prisma.$transaction(work, options);
    } catch (error) {
      if (error?.code !== 'P2034') throw error;
      if (attempt === maxAttempts) {
        throw new ConflictError('报名信息已被更新，请重试');
      }
    }
  }
  throw new ConflictError('报名信息已被更新，请重试');
};

const updateRecord = async (delegate, record, data) => {
  const updated = await delegate.update({ where: { id: record.id }, data });
  Object.assign(record, updated);
  return record;
};

const audit = (action, actorId, options = {}) => {
  const client = options.transaction || prisma;
  return client.enrollmentAuditLog.create({ data: {
    applicationId: options.applicationId || null,
    actorId: actorId || 'public',
    action,
    details: options.details || {},
    requestId: options.requestId || null,
  } });
};

const getActiveSeason = async (transaction) => {
  const client = transaction || prisma;
  const season = await client.enrollmentSeason.findFirst({
    where: { active: true },
    orderBy: { year: 'desc' },
  });
  if (!season) throw new ServiceUnavailableError('当前暂无可用招生年度');
  return season;
};

const getOwnedApplication = async (id, userId, options = {}) => {
  const client = options.transaction || prisma;
  const application = await client.enrollmentApplication.findUnique({
    where: { id },
    include: { school: true },
  });
  if (!application) throw new NotFoundError('报名记录不存在');
  if (application.ownerUserId !== userId) throw new ForbiddenError('无权访问该报名记录');
  return application;
};

const requireEditable = (application) => {
  if (!EDITABLE_STATUSES.includes(application.status)) {
    throw new ConflictError('当前状态不能修改报名信息');
  }
};

const reviewerSchoolIds = (reviewer) => {
  if (reviewer?.roles?.includes('admin')) return null;
  const schoolIds = Array.isArray(reviewer?.schoolIds) ? reviewer.schoolIds : [];
  if (schoolIds.length === 0) throw new ForbiddenError('审核账号未配置可管理学校');
  return schoolIds;
};

const assertReviewerSchoolAccess = (application, reviewer) => {
  const schoolIds = reviewerSchoolIds(reviewer);
  if (schoolIds && !schoolIds.includes(application.schoolId)) {
    throw new ForbiddenError('无权访问其他学校的报名记录');
  }
};

const assertRegistrationWindowOpen = async (seasonId, stage, category, transaction) => {
  const client = transaction || prisma;
  const window = await client.enrollmentWindow.findFirst({
    where: { seasonId, stage, category },
  });
  if (!window) throw new ServiceUnavailableError('当前报名入口未配置报名时间');
  const now = Date.now();
  if (now < new Date(window.startsAt).getTime() || now > new Date(window.endsAt).getTime()) {
    throw new ConflictError('当前不在该学段和类别的报名时间内');
  }
  return window;
};

const mergeObjects = (current, patch) => {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return patch;
  const result = current && typeof current === 'object' && !Array.isArray(current) ? { ...current } : {};
  for (const [key, value] of Object.entries(patch)) {
    if (['__proto__', 'constructor', 'prototype'].includes(key)) continue;
    result[key] = value && typeof value === 'object' && !Array.isArray(value)
      ? mergeObjects(result[key], value)
      : value;
  }
  return result;
};

const changedPaths = (original, declared, prefix = '') => {
  if (JSON.stringify(original) === JSON.stringify(declared)) return [];
  if (!original || !declared || typeof original !== 'object' || typeof declared !== 'object') {
    return [prefix || '$'];
  }
  const keys = new Set([...Object.keys(original), ...Object.keys(declared)]);
  return [...keys].flatMap((key) => changedPaths(
    original[key],
    declared[key],
    prefix ? `${prefix}.${key}` : key
  ));
};

const requiresVerificationReason = (type, paths) => {
  const keyPatterns = {
    household: /(name|document|address|relation|head)/i,
    property: /(owner|document|certificate|address|usage|relation)/i,
    social_security: /(person|document|region|status|first|months)/i,
    business_license: /(credit|name|operator|representative|type|address|date|status|relation)/i,
    parents_no_property: /(name|document|region|result)/i,
  };
  const pattern = keyPatterns[type];
  return Boolean(pattern && paths.some((path) => pattern.test(path)));
};

const snapshot = (application, extras = {}) => ({
  applicationId: application.id,
  status: application.status,
  studentName: decrypt(application.studentNameEncrypted, ''),
  studentIdNumber: decrypt(application.studentIdEncrypted, ''),
  data: decrypt(application.payloadEncrypted, {}),
  policyVersion: application.policyVersion,
  policyConfirmedAt: application.policyConfirmedAt,
  authorizationVersion: application.authorizationVersion,
  authorizedAt: application.authorizedAt,
  declarationVersion: application.declarationVersion,
  truthConfirmedAt: application.truthConfirmedAt,
  submittedAt: application.submittedAt,
  reviewMessage: application.reviewMessage,
  returnedFields: application.returnedFields,
  offlineArrangement: application.offlineArrangement,
  admittedSchoolName: application.admittedSchoolName,
  ...extras,
});

const saveVersion = (application, event, actorId, transaction, note = null, extras = {}) => (
  transaction.enrollmentApplicationVersion.create({ data: {
    applicationId: application.id,
    version: application.draftVersion,
    event,
    snapshotEncrypted: encrypt(snapshot(application, extras)),
    createdBy: actorId,
    note,
  } })
);

const serializeSchool = (school) => school && ({
  id: school.id,
  seasonId: school.seasonId,
  stage: school.stage,
  category: school.category,
  name: school.name,
  address: school.address,
  scopeSummary: school.scopeSummary,
  policyTitle: school.policyTitle,
  policyVersion: school.policyVersion,
  formRules: school.formRules,
});

const serializeApplication = (application, extras = {}) => ({
  id: application.id,
  seasonId: application.seasonId,
  schoolId: application.schoolId,
  school: serializeSchool(application.school),
  stage: application.stage,
  category: application.category,
  status: application.status,
  statusLabel: STATUS_LABELS[application.status],
  studentName: decrypt(application.studentNameEncrypted, ''),
  studentIdNumber: decrypt(application.studentIdEncrypted, ''),
  data: decrypt(application.payloadEncrypted, {}),
  version: application.draftVersion,
  policyVersion: application.policyVersion,
  policyConfirmedAt: application.policyConfirmedAt,
  authorizationVersion: application.authorizationVersion,
  authorizedAt: application.authorizedAt,
  declarationVersion: application.declarationVersion,
  truthConfirmedAt: application.truthConfirmedAt,
  submittedAt: application.submittedAt,
  submissionReceipt: application.submissionReceipt,
  reviewMessage: application.reviewMessage,
  returnedFields: application.returnedFields,
  offlineArrangement: application.offlineArrangement,
  admittedSchoolName: application.admittedSchoolName,
  hasUpdate: application.hasUpdate,
  createdAt: application.createdAt,
  updatedAt: application.updatedAt,
  ...extras,
});

module.exports = {
  withSerializableTransaction,
  updateRecord,
  audit,
  getActiveSeason,
  getOwnedApplication,
  requireEditable,
  reviewerSchoolIds,
  assertReviewerSchoolAccess,
  assertRegistrationWindowOpen,
  mergeObjects,
  changedPaths,
  requiresVerificationReason,
  saveVersion,
  serializeSchool,
  serializeApplication,
};

