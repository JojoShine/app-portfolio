const { VERIFICATION_TYPES } = require('../domain/constants');
const { encrypt, decrypt } = require('../utils/crypto');
const department = require('./department.service');
const {
  ValidationError,
  NotFoundError,
  ForbiddenError,
} = require('../../../common/utils/error');
const {
  withSerializableTransaction,
  updateRecord,
  audit,
  getOwnedApplication,
  requireEditable,
  changedPaths,
  requiresVerificationReason,
  saveVersion,
  serializeApplication,
} = require('./enrollment.shared');

const runVerifications = async (id, userId, input, context = {}) => withSerializableTransaction(async (transaction) => {
  const application = await getOwnedApplication(id, userId, { transaction });
  requireEditable(application);
  const allowedTypes = Array.isArray(application.school?.formRules?.verificationTypes)
    ? application.school.formRules.verificationTypes
    : VERIFICATION_TYPES;
  const requestedTypes = input.types || allowedTypes;
  const disallowedTypes = requestedTypes.filter((type) => !allowedTypes.includes(type));
  if (disallowedTypes.length) throw new ForbiddenError('目标学校政策不需要查询该类共享数据');
  const payload = decrypt(application.payloadEncrypted, {});
  const departmentData = { ...(payload.departmentData || {}) };
  const results = [];

  for (const type of requestedTypes) {
    const existingVerification = await transaction.enrollmentVerification.findUnique({
      where: { applicationId_type: { applicationId: id, type } },
    });
    if (existingVerification?.manuallyModified) {
      const declaredData = decrypt(existingVerification.declaredEncrypted, null);
      departmentData[type] = {
        status: 'manually_modified',
        data: declaredData,
        source: existingVerification.source,
        queriedAt: existingVerification.queriedAt,
        manuallyModified: true,
        modificationReason: existingVerification.modificationReason,
      };
      results.push({
        id: existingVerification.id,
        type,
        status: 'preserved_manual_value',
        data: declaredData,
        source: existingVerification.source,
        queriedAt: existingVerification.queriedAt,
        manuallyModified: true,
      });
      continue;
    }
    const lookup = await department.lookup(transaction, application, type);
    const originalData = lookup.data;
    const values = {
      source: lookup.source,
      adapterVersion: 'database-v1',
      queriedAt: new Date(),
      status: lookup.status,
      originalEncrypted: encrypt(originalData),
      declaredEncrypted: encrypt(originalData),
      manuallyModified: false,
      modificationReason: null,
      failureReason: lookup.failureReason,
    };
    const record = await transaction.enrollmentVerification.upsert({
      where: { applicationId_type: { applicationId: id, type } },
      create: { applicationId: id, type, ...values },
      update: values,
    });
    departmentData[type] = {
      status: values.status,
      data: originalData,
      source: values.source,
      queriedAt: values.queriedAt,
      failureReason: values.failureReason,
    };
    results.push({
      id: record.id,
      type,
      status: values.status,
      data: originalData,
      source: values.source,
      queriedAt: values.queriedAt,
      failureReason: values.failureReason,
    });
  }

  await updateRecord(transaction.enrollmentApplication, application, {
    authorizationVersion: input.authorizationVersion,
    authorizedAt: new Date(),
    payloadEncrypted: encrypt({ ...payload, departmentData }),
    draftVersion: application.draftVersion + 1,
  });
  await saveVersion(application, 'department_data_queried', userId, transaction);
  await audit('application.department_data_queried', userId, {
    applicationId: id,
    requestId: context.requestId,
    transaction,
    details: { types: requestedTypes, failedTypes: results.filter((item) => item.status === 'failed').map((item) => item.type) },
  });
  return { application: serializeApplication(application), results };
}, { isolationLevel: 'Serializable' });

const updateVerification = async (id, verificationId, userId, input, context = {}) => withSerializableTransaction(async (transaction) => {
  const application = await getOwnedApplication(id, userId, { transaction });
  requireEditable(application);
  const verification = await transaction.enrollmentVerification.findFirst({
    where: { id: verificationId, applicationId: id },
  });
  if (!verification) throw new NotFoundError('共享数据记录不存在');
  const originalData = decrypt(verification.originalEncrypted, null);
  const modifiedFields = changedPaths(originalData, input.declaredData);
  const modified = modifiedFields.length > 0;
  if (modified && requiresVerificationReason(verification.type, modifiedFields) && !input.modificationReason) {
    throw new ValidationError('修改关键共享数据后请填写修改原因');
  }
  await updateRecord(transaction.enrollmentVerification, verification, {
    declaredEncrypted: encrypt(input.declaredData),
    manuallyModified: modified,
    modificationReason: modified ? input.modificationReason : null,
    status: 'declared',
  });
  const payload = decrypt(application.payloadEncrypted, {});
  const departmentData = { ...(payload.departmentData || {}) };
  departmentData[verification.type] = {
    ...(departmentData[verification.type] || {}),
    status: modified ? 'manually_modified' : 'confirmed',
    data: input.declaredData,
    manuallyModified: modified,
    modificationReason: modified ? input.modificationReason : null,
  };
  await updateRecord(transaction.enrollmentApplication, application, {
    payloadEncrypted: encrypt({ ...payload, departmentData }),
    draftVersion: application.draftVersion + 1,
  });
  await saveVersion(application, 'department_data_declared', userId, transaction);
  await audit('application.department_data_modified', userId, {
    applicationId: id,
    requestId: context.requestId,
    transaction,
    details: { type: verification.type, manuallyModified: modified, modifiedFields },
  });
  return serializeApplication(application);
}, { isolationLevel: 'Serializable' });

module.exports = {
  runVerifications,
  updateVerification,
};
