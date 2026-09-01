const crypto = require('crypto');
const database = require('../db');
const enrollmentApplication = database.enrollmentApplication;
const enrollmentMaterial = database.enrollmentMaterial;
const enrollmentVerification = database.enrollmentVerification;
const { ACTIVE_APPLICATION_STATUSES } = require('../domain/constants');
const { encrypt, decrypt, digest } = require('../utils/crypto');
const { synchronizeVerificationData } = require('../domain/verification-mapping');
const {
  ValidationError,
  NotFoundError,
  ConflictError,
} = require('../../../common/utils/error');
const {
  withSerializableTransaction,
  updateRecord,
  audit,
  getOwnedApplication,
  requireEditable,
  assertRegistrationWindowOpen,
  mergeObjects,
  saveVersion,
  serializeApplication,
} = require('./enrollment.shared');

const createApplicationNumber = () => {
  const date = new Date();
  const datePart = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date).reduce((result, part) => {
    if (part.type !== 'literal') result[part.type] = part.value;
    return result;
  }, {});
  const randomPart = crypto.randomBytes(6).readUIntBE(0, 6).toString().padStart(15, '0');
  return `BM${datePart.year}${datePart.month}${datePart.day}${randomPart}`;
};

const createApplication = async (userId, input, context = {}) => withSerializableTransaction(async (transaction) => {
  const school = await transaction.enrollmentSchool.findFirst({
    where: { id: input.schoolId, active: true },
    include: { season: true },
  });
  if (!school || !school.season.active) throw new NotFoundError('学校不存在或已停止报名');
  await assertRegistrationWindowOpen(school.seasonId, school.stage, school.category, transaction);

  const studentIdHash = digest(input.studentIdNumber);
  const duplicate = await transaction.enrollmentApplication.findFirst({
    where: {
      seasonId: school.seasonId,
      stage: school.stage,
      studentIdHash,
      status: { in: ACTIVE_APPLICATION_STATUSES },
    },
  });
  if (duplicate) throw new ConflictError('该学生在当前年度和学段已有有效报名');

  const initialPayload = {
    student: {
      name: input.studentName,
      documentNumber: input.studentIdNumber,
    },
  };
  const application = await transaction.enrollmentApplication.create({ data: {
    ownerUserId: userId,
    seasonId: school.seasonId,
    schoolId: school.id,
    stage: school.stage,
    category: school.category,
    studentNameEncrypted: encrypt(input.studentName),
    studentNameHash: digest(input.studentName),
    studentIdEncrypted: encrypt(input.studentIdNumber),
    studentIdHash,
    studentIdLastSixHash: digest(input.studentIdNumber.slice(-6)),
    payloadEncrypted: encrypt(initialPayload),
    submissionReceipt: createApplicationNumber(),
    draftVersion: 1,
  } });
  application.school = school;
  await saveVersion(application, 'created', userId, transaction);
  await audit('application.created', userId, {
    applicationId: application.id,
    requestId: context.requestId,
    transaction,
    details: { schoolId: school.id, stage: school.stage, category: school.category },
  });
  return serializeApplication(application);
}, { isolationLevel: 'Serializable' });

const listApplications = async (userId, filters = {}) => {
  const where = { ownerUserId: userId };
  if (filters.stage) where.stage = filters.stage;
  if (filters.studentName) where.studentNameHash = digest(filters.studentName);
  const seasonWhere = filters.year ? { year: Number(filters.year) } : { active: true };
  where.season = seasonWhere;
  const applications = await enrollmentApplication.findMany({
    where,
    include: { school: true, season: true },
    orderBy: { createdAt: 'desc' },
  });
  return applications.map((application) => serializeApplication(application, {
      year: application.season?.year,
      data: undefined,
    }));
};

const getApplication = async (id, userId, context = {}) => {
  const application = await getOwnedApplication(id, userId);
  const [verifications, materials] = await Promise.all([
    enrollmentVerification.findMany({ where: { applicationId: id }, orderBy: { createdAt: 'asc' } }),
    enrollmentMaterial.findMany({
      where: { applicationId: id, deletedAt: null },
      include: { file: true },
      orderBy: [{ itemCode: 'asc' }, { sort: 'asc' }],
    }),
  ]);

  const serializedMaterials = materials.map((item) => {
    const material = item;
    const file = item.file;
    return {
      id: material.id,
      itemCode: material.itemCode,
      sort: material.sort,
      file: file ? {
        id: file.id,
        mimeType: file.mimeType,
        size: file.size,
        originalName: file.originalName,
      } : { id: material.fileId },
    };
  });

  await enrollmentApplication.updateMany({
    where: { id, ownerUserId: userId },
    data: { hasUpdate: false, lastViewedAt: new Date() },
  });
  await audit('application.viewed', userId, { applicationId: id, requestId: context.requestId });
  return serializeApplication(application, {
    hasUpdate: false,
    verifications: verifications.map((item) => ({
      id: item.id,
      type: item.type,
      source: item.source,
      adapterVersion: item.adapterVersion,
      queriedAt: item.queriedAt,
      status: item.status,
      originalData: decrypt(item.originalEncrypted, null),
      declaredData: decrypt(item.declaredEncrypted, null),
      manuallyModified: item.manuallyModified,
      modificationReason: item.modificationReason,
      failureReason: item.failureReason,
    })),
    materials: serializedMaterials,
  });
};

const updateDraft = async (id, userId, input, context = {}) => withSerializableTransaction(async (transaction) => {
  const application = await getOwnedApplication(id, userId, { transaction });
  requireEditable(application);
  if (application.draftVersion !== input.expectedVersion) {
    throw new ConflictError('报名信息已在其他页面更新，请刷新后重试');
  }

  const currentPayload = decrypt(application.payloadEncrypted, {});
  const nextPayload = mergeObjects(currentPayload, input.data);
  const currentStudentName = decrypt(application.studentNameEncrypted, '');
  const currentStudentIdNumber = decrypt(application.studentIdEncrypted, '');
  const nextStudentName = input.studentName || currentStudentName;
  const nextStudentIdNumber = input.studentIdNumber || currentStudentIdNumber;
  nextPayload.student = {
    ...(nextPayload.student || {}),
    name: nextStudentName,
    documentNumber: nextStudentIdNumber,
  };
  const changes = {
    payloadEncrypted: encrypt(nextPayload),
    draftVersion: application.draftVersion + 1,
  };
  if (input.studentName || input.studentIdNumber) {
    const studentName = nextStudentName;
    const studentIdNumber = nextStudentIdNumber;
    const studentIdHash = digest(studentIdNumber);
    const duplicate = await transaction.enrollmentApplication.findFirst({
      where: {
        id: { not: application.id },
        seasonId: application.seasonId,
        stage: application.stage,
        studentIdHash,
        status: { in: ACTIVE_APPLICATION_STATUSES },
      },
    });
    if (duplicate) throw new ConflictError('该学生在当前年度和学段已有有效报名');
    changes.studentNameEncrypted = encrypt(studentName);
    changes.studentNameHash = digest(studentName);
    changes.studentIdEncrypted = encrypt(studentIdNumber);
    changes.studentIdHash = studentIdHash;
    changes.studentIdLastSixHash = digest(studentIdNumber.slice(-6));
  }

  const verifications = await transaction.enrollmentVerification.findMany({
    where: {
      applicationId: id,
      status: { not: 'failed' },
      originalEncrypted: { not: null },
    },
  });
  const synchronizedTypes = [];
  for (const verification of verifications) {
    const originalData = decrypt(verification.originalEncrypted, null);
    if (!originalData) continue;
    const declaredData = decrypt(verification.declaredEncrypted, originalData);
    const synchronization = synchronizeVerificationData({
      type: verification.type,
      originalData,
      declaredData,
      payload: nextPayload,
      patch: input.data,
    });
    if (synchronization.changedFields.length === 0) continue;

    const criticalChanged = synchronization.changedFields.some((field) => field.critical);
    const suppliedReason = input.verificationModificationReasons[verification.type];
    if (criticalChanged && !suppliedReason) {
      throw new ValidationError(`修改${verification.type}关键核验数据时请填写修改原因`);
    }
    const modificationReason = synchronization.manuallyModified
      ? (suppliedReason || verification.modificationReason)
      : null;
    await updateRecord(transaction.enrollmentVerification, verification, {
      declaredEncrypted: encrypt(synchronization.nextDeclaredData),
      manuallyModified: synchronization.manuallyModified,
      modificationReason,
      status: 'declared',
    });

    nextPayload.departmentData = { ...(nextPayload.departmentData || {}) };
    nextPayload.departmentData[verification.type] = {
      ...(nextPayload.departmentData[verification.type] || {}),
      status: synchronization.manuallyModified ? 'manually_modified' : 'confirmed',
      data: synchronization.nextDeclaredData,
      manuallyModified: synchronization.manuallyModified,
      modificationReason,
    };
    synchronizedTypes.push(verification.type);
  }
  changes.payloadEncrypted = encrypt(nextPayload);
  await updateRecord(transaction.enrollmentApplication, application, changes);
  await saveVersion(application, 'draft_saved', userId, transaction);
  await audit('application.draft_saved', userId, {
    applicationId: id,
    requestId: context.requestId,
    transaction,
    details: { version: application.draftVersion, synchronizedVerificationTypes: synchronizedTypes },
  });
  return serializeApplication(application);
}, { isolationLevel: 'Serializable' });

const changeSchool = async (id, userId, input, context = {}) => withSerializableTransaction(async (transaction) => {
  const application = await getOwnedApplication(id, userId, { transaction });
  if (application.status !== 'draft') throw new ConflictError('只有待提交报名可以更换学校');
  if (application.draftVersion !== input.expectedVersion) {
    throw new ConflictError('报名信息已更新，请刷新后重试');
  }
  const school = await transaction.enrollmentSchool.findFirst({
    where: {
      id: input.schoolId,
      seasonId: application.seasonId,
      stage: application.stage,
      active: true,
    },
  });
  if (!school) throw new NotFoundError('目标学校不存在或不属于当前学段');
  await assertRegistrationWindowOpen(application.seasonId, application.stage, school.category, transaction);
  await updateRecord(transaction.enrollmentApplication, application, {
    schoolId: school.id,
    category: school.category,
    policyVersion: null,
    policyConfirmedAt: null,
    draftVersion: application.draftVersion + 1,
  });
  application.school = school;
  await saveVersion(application, 'school_changed', userId, transaction);
  await audit('application.school_changed', userId, {
    applicationId: id,
    requestId: context.requestId,
    transaction,
    details: { schoolId: school.id, category: school.category },
  });
  return serializeApplication(application);
}, { isolationLevel: 'Serializable' });

const confirmPolicy = async (id, userId, input, context = {}) => withSerializableTransaction(async (transaction) => {
  const application = await getOwnedApplication(id, userId, { transaction });
  requireEditable(application);
  if (input.policyVersion !== application.school.policyVersion) {
    throw new ConflictError('政策版本已更新，请重新阅读');
  }
  await updateRecord(transaction.enrollmentApplication, application, {
    policyVersion: input.policyVersion,
    policyConfirmedAt: new Date(),
    draftVersion: application.draftVersion + 1,
  });
  await saveVersion(application, 'policy_confirmed', userId, transaction);
  await audit('application.policy_confirmed', userId, {
    applicationId: id,
    requestId: context.requestId,
    transaction,
    details: { policyVersion: input.policyVersion },
  });
  return serializeApplication(application);
}, { isolationLevel: 'Serializable' });

const validateSubmissionData = async (application, transaction) => {
  const payload = decrypt(application.payloadEncrypted, {});
  const student = payload.student || {};
  const family = payload.family || {};
  const property = payload.property || {};
  const materials = payload.materials || {};
  const requiredStudent = [
    ['documentType', '学生证件类型'],
    ['householdLocation', '学生户籍所在地'],
  ];
  const missing = requiredStudent
    .filter(([key]) => !String(student[key] || '').trim())
    .map(([, label]) => label);
  if (!String(student.currentAddress || student.residenceAddress || '').trim()) {
    missing.push('学生当前居住地址');
  }
  if (application.stage === 'middle') {
    if (!student.previousPrimarySchool && !student.previousSchool) missing.push('原小学');
    if (!student.studentRegistrationNumber && !student.studentRecordNumber) missing.push('学籍号');
  }

  const requiredFamily = [
    ['guardianName', '监护人姓名'],
    ['guardianRelation', '监护人与学生关系'],
    ['guardianDocument', '监护人证件号码'],
    ['guardianPhone', '监护人联系电话'],
    ['householdHeadName', '户主姓名'],
    ['householdHeadDocument', '户主证件号码'],
    ['householdHeadPhone', '户主联系电话'],
    ['householdHeadRelation', '户主与学生关系'],
    ['householdAddress', '户籍地址'],
  ];
  missing.push(...requiredFamily
    .filter(([key]) => !String(family[key] || '').trim())
    .map(([, label]) => label));

  for (const [prefix, label] of [['father', '父亲'], ['mother', '母亲']]) {
    const complete = ['Name', 'Document', 'Phone'].every((suffix) => String(family[`${prefix}${suffix}`] || '').trim());
    const missingReason = String(family[`${prefix}MissingReason`] || '').trim();
    if (!complete && (!missingReason || missingReason === '信息完整')) missing.push(`${label}信息或缺失原因`);
  }

  if (materials.socialEnabled) {
    for (const [key, label] of [
      ['socialPerson', '参保人'],
      ['socialDocument', '参保人证件号码'],
      ['socialRegion', '参保地区'],
      ['socialStatus', '参保状态'],
      ['socialFirstDate', '首次参保时间'],
      ['socialMonths', '连续缴纳月数'],
    ]) if (!String(materials[key] ?? '').trim()) missing.push(label);
  }
  if (materials.businessEnabled) {
    for (const [key, label] of [
      ['businessOwnerRelation', '营业执照与学生关系'],
      ['businessCreditCode', '统一社会信用代码'],
      ['businessName', '市场主体名称'],
      ['businessOperator', '经营者或法定代表人'],
      ['businessType', '市场主体类型'],
      ['businessAddress', '注册地址'],
      ['businessEstablishedDate', '成立日期'],
      ['businessStatus', '登记状态'],
    ]) if (!String(materials[key] ?? '').trim()) missing.push(label);
  }
  if (materials.noPropertyEnabled) {
    if (!String(materials.fatherNoPropertyResult || '').trim()) missing.push('父亲无房核验结果');
    if (!String(materials.motherNoPropertyResult || '').trim()) missing.push('母亲无房核验结果');
  }

  if (property.hasProperty === false) {
    if (!String(property.residenceAddress || student.currentAddress || student.residenceAddress || '').trim()) {
      missing.push('当前居住地址');
    }
  } else {
    const requiredProperty = [
      ['ownerName', '不动产权利人'],
      ['ownerDocument', '权利人证件号码'],
      ['relation', '权利人与学生关系'],
      ['certificateNumber', '不动产权证号'],
      ['address', '房产地址'],
      ['usage', '房产用途'],
      ['area', '建筑面积'],
    ];
    missing.push(...requiredProperty
      .filter(([key]) => !String(property[key] ?? '').trim())
      .map(([, label]) => label));
  }

  const getPath = (source, path) => path.split('.').reduce((value, key) => value?.[key], source);
  const configuredFields = Array.isArray(application.school?.formRules?.requiredFields)
    ? application.school.formRules.requiredFields
    : [];
  for (const item of configuredFields) {
    const path = typeof item === 'string' ? item : item.path;
    const label = typeof item === 'string' ? item : (item.label || item.path);
    if (path && !String(getPath(payload, path) ?? '').trim()) missing.push(label);
  }
  if (missing.length) throw new ValidationError('报名信息尚未完整', { missingFields: missing });

  const linkedMaterials = await transaction.enrollmentMaterial.findMany({
    where: { applicationId: application.id, deletedAt: null },
    select: { itemCode: true },
  });
  const linkedCodes = new Set(linkedMaterials.map((item) => item.itemCode));
  const rules = application.school?.formRules || {};
  const configuredMaterials = Array.isArray(rules.requiredMaterialItems)
    ? rules.requiredMaterialItems
    : (Array.isArray(rules.materialItems) ? rules.materialItems : []);
  const requiredMaterialCodes = new Set(['student_photo', ...configuredMaterials]);
  if (property.hasProperty === false) requiredMaterialCodes.delete('property_certificate');
  if (!materials.socialEnabled) requiredMaterialCodes.delete('social_security_proof');
  if (!materials.businessEnabled) requiredMaterialCodes.delete('business_license');
  const needsParentsNoProperty = Boolean(
    materials.noPropertyEnabled
    || (rules.parentsNoPropertyRequiredWhenGrandparentProperty && /[祖外]/.test(String(property.relation || '')))
  );
  if (!needsParentsNoProperty) requiredMaterialCodes.delete('parents_no_property_proof');
  const missingMaterials = [...requiredMaterialCodes].filter((code) => !linkedCodes.has(code));
  if (missingMaterials.length) {
    throw new ValidationError('报名材料尚未完整', { missingMaterialItems: missingMaterials });
  }
};

const submitApplication = async (id, userId, input, context = {}) => withSerializableTransaction(async (transaction) => {
  const application = await getOwnedApplication(id, userId, { transaction });
  if (application.idempotencyKey === input.idempotencyKey && application.submissionReceipt) {
    return serializeApplication(application);
  }
  requireEditable(application);
  if (application.status === 'draft') {
    await assertRegistrationWindowOpen(application.seasonId, application.stage, application.category, transaction);
  }
  if (application.draftVersion !== input.expectedVersion) {
    throw new ConflictError('报名信息已更新，请返回预览页重新确认');
  }
  if (!application.policyConfirmedAt || application.policyVersion !== application.school.policyVersion) {
    throw new ValidationError('请先阅读并确认学校招生政策');
  }
  if (!application.authorizedAt) throw new ValidationError('请先完成部门数据查询授权');
  await validateSubmissionData(application, transaction);
  await updateRecord(transaction.enrollmentApplication, application, {
    status: 'reviewing',
    declarationVersion: input.declarationVersion,
    truthConfirmedAt: new Date(),
    submittedAt: new Date(),
    submissionReceipt: application.submissionReceipt || createApplicationNumber(),
    idempotencyKey: input.idempotencyKey,
    reviewMessage: null,
    returnedFields: [],
    draftVersion: application.draftVersion + 1,
    hasUpdate: false,
  });
  const [submittedMaterials, submittedVerifications] = await Promise.all([
    transaction.enrollmentMaterial.findMany({
      where: { applicationId: id, deletedAt: null },
      select: { id: true, fileId: true, itemCode: true, sort: true },
      orderBy: [{ itemCode: 'asc' }, { sort: 'asc' }],
    }),
    transaction.enrollmentVerification.findMany({
      where: { applicationId: id },
      orderBy: { type: 'asc' },
    }),
  ]);
  await saveVersion(application, 'submitted', userId, transaction, null, {
    materials: submittedMaterials,
    verifications: submittedVerifications.map((item) => ({
      id: item.id,
      type: item.type,
      status: item.status,
      source: item.source,
      adapterVersion: item.adapterVersion,
      queriedAt: item.queriedAt,
      originalData: decrypt(item.originalEncrypted, null),
      declaredData: decrypt(item.declaredEncrypted, null),
      manuallyModified: item.manuallyModified,
      modificationReason: item.modificationReason,
      failureReason: item.failureReason,
    })),
  });
  await audit('application.submitted', userId, {
    applicationId: id,
    requestId: context.requestId,
    transaction,
    details: { version: application.draftVersion, receipt: application.submissionReceipt },
  });
  return serializeApplication(application);
}, { isolationLevel: 'Serializable' });

module.exports = {
  createApplication,
  listApplications,
  getApplication,
  updateDraft,
  changeSchool,
  confirmPolicy,
  submitApplication,
};
