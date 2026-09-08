const database = require('../db');
const enrollmentApplication = database.enrollmentApplication;
const enrollmentApplicationVersion = database.enrollmentApplicationVersion;
const enrollmentMaterial = database.enrollmentMaterial;
const enrollmentVerification = database.enrollmentVerification;
const fileService = require('../../../system/file/services/file.service');
const { STATUS_LABELS } = require('../domain/constants');
const { decrypt, maskIdNumber } = require('../utils/crypto');
const {
  ValidationError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} = require('../../../common/utils/error');
const {
  withSerializableTransaction,
  updateRecord,
  audit,
  reviewerSchoolIds,
  assertReviewerSchoolAccess,
  saveVersion,
  serializeSchool,
  serializeApplication,
} = require('./enrollment.shared');

const reviewApplication = async (id, reviewer, input, context = {}) => withSerializableTransaction(async (transaction) => {
  const application = await transaction.enrollmentApplication.findUnique({
    where: { id },
    include: { school: true },
  });
  if (!application) throw new NotFoundError('报名记录不存在');
  assertReviewerSchoolAccess(application, reviewer);
  if (application.status !== 'reviewing') throw new ConflictError('只有审核中的报名可以初审');
  const statusMap = { return: 'returned', approve: 'initial_approved', reject: 'initial_rejected' };
  await updateRecord(transaction.enrollmentApplication, application, {
    status: statusMap[input.action],
    reviewMessage: input.reason,
    returnedFields: input.action === 'return' ? input.fields : [],
    hasUpdate: true,
    draftVersion: application.draftVersion + 1,
  });
  await saveVersion(application, `review_${input.action}`, reviewer.id, transaction, input.reason);
  await audit(`application.review_${input.action}`, reviewer.id, {
    applicationId: id,
    requestId: context.requestId,
    transaction,
    details: { fields: input.fields },
  });
  return serializeApplication(application);
}, { isolationLevel: 'Serializable' });

const listReviewApplications = async (filters = {}, reviewer) => {
  const reviewStatuses = ['reviewing', 'returned', 'initial_approved', 'initial_rejected', 'admitted'];
  const status = filters.status || 'reviewing';
  if (!reviewStatuses.includes(status)) throw new ValidationError('审核列表状态不正确');
  const where = { status };
  if (filters.stage) where.stage = filters.stage;
  const allowedSchoolIds = reviewerSchoolIds(reviewer);
  if (filters.schoolId) {
    if (allowedSchoolIds && !allowedSchoolIds.includes(filters.schoolId)) {
      throw new ForbiddenError('无权查看其他学校的报名');
    }
    where.schoolId = filters.schoolId;
  } else if (allowedSchoolIds) {
    where.schoolId = { in: allowedSchoolIds };
  }
  const applications = await enrollmentApplication.findMany({
    where,
    include: { school: true, season: true },
    orderBy: [{ submittedAt: 'asc' }, { createdAt: 'asc' }],
    take: 200,
  });
  return applications.map((application) => ({
    id: application.id,
    year: application.season?.year,
    school: serializeSchool(application.school),
    stage: application.stage,
    category: application.category,
    status: application.status,
    statusLabel: STATUS_LABELS[application.status],
    studentName: decrypt(application.studentNameEncrypted, ''),
    studentIdNumber: maskIdNumber(decrypt(application.studentIdEncrypted, '')),
    submittedAt: application.submittedAt,
    updatedAt: application.updatedAt,
    hasUpdate: application.hasUpdate,
  }));
};

const getReviewApplication = async (id, reviewer, context = {}) => {
  const application = await enrollmentApplication.findUnique({
    where: { id },
    include: { school: true, season: true },
  });
  if (!application) throw new NotFoundError('报名记录不存在');
  assertReviewerSchoolAccess(application, reviewer);
  if (application.status === 'draft') throw new ForbiddenError('待提交草稿不开放给审核端');
  const [verifications, materials, versions] = await Promise.all([
    enrollmentVerification.findMany({ where: { applicationId: id }, orderBy: { createdAt: 'asc' } }),
    enrollmentMaterial.findMany({
      where: { applicationId: id, deletedAt: null },
      include: { file: true },
      orderBy: [{ itemCode: 'asc' }, { sort: 'asc' }],
    }),
    enrollmentApplicationVersion.findMany({
      where: { applicationId: id },
      select: { id: true, version: true, event: true, createdBy: true, note: true, createdAt: true },
      orderBy: { version: 'desc' },
    }),
  ]);
  await audit('application.review_viewed', reviewer.id, { applicationId: id, requestId: context.requestId });
  return serializeApplication(application, {
    year: application.season?.year,
    verifications: verifications.map((item) => ({
      id: item.id,
      type: item.type,
      source: item.source,
      queriedAt: item.queriedAt,
      status: item.status,
      originalData: decrypt(item.originalEncrypted, null),
      declaredData: decrypt(item.declaredEncrypted, null),
      manuallyModified: item.manuallyModified,
      modificationReason: item.modificationReason,
      failureReason: item.failureReason,
    })),
    materials: materials.map((item) => ({
      id: item.id,
      itemCode: item.itemCode,
      sort: item.sort,
      file: item.file ? {
        id: item.file.id,
        mimeType: item.file.mimeType,
        size: item.file.size,
        originalName: item.file.originalName,
      } : { id: item.fileId },
    })),
    versions,
  });
};

const getReviewMaterialFile = async (applicationId, materialId, reviewer, context = {}) => {
  const application = await enrollmentApplication.findUnique({ where: { id: applicationId } });
  if (!application) throw new NotFoundError('报名记录不存在');
  assertReviewerSchoolAccess(application, reviewer);
  if (application.status === 'draft') throw new ForbiddenError('待提交草稿不开放给审核端');
  const material = await enrollmentMaterial.findFirst({
    where: { id: materialId, applicationId, deletedAt: null },
  });
  if (!material) throw new NotFoundError('材料不存在');
  await audit('application.material_viewed_by_reviewer', reviewer.id, {
    applicationId,
    requestId: context.requestId,
    details: { materialId },
  });
  return fileService.getFileStream(material.fileId, {
    ...reviewer,
    roles: [...new Set([...(reviewer.roles || []), 'admin'])],
  });
};

const admitApplication = async (id, actorId, input, context = {}) => withSerializableTransaction(async (transaction) => {
  const application = await transaction.enrollmentApplication.findUnique({
    where: { id },
    include: { school: true },
  });
  if (!application) throw new NotFoundError('报名记录不存在');
  if (application.status !== 'initial_approved') throw new ConflictError('只有初审通过的报名可以确定录取结果');
  await updateRecord(transaction.enrollmentApplication, application, {
    status: 'admitted',
    admittedSchoolName: input.schoolName,
    hasUpdate: true,
    draftVersion: application.draftVersion + 1,
  });
  await saveVersion(application, 'admitted', actorId, transaction);
  await audit('application.admitted', actorId, {
    applicationId: id,
    requestId: context.requestId,
    transaction,
    details: { schoolName: input.schoolName },
  });
  return serializeApplication(application);
}, { isolationLevel: 'Serializable' });

module.exports = {
  reviewApplication,
  listReviewApplications,
  getReviewApplication,
  getReviewMaterialFile,
  admitApplication,
};
