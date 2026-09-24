const { decrypt } = require('../utils/crypto');

exports.lookup = async (database, application, type) => {
  const record = await database.enrollmentDepartmentRecord.findFirst({
    where: { userId: application.ownerUserId, studentIdHash: application.studentIdHash, type, active: true },
  });
  if (!record) return { status: 'not_found', data: null, source: 'department.database', failureReason: '暂未查到共享数据，请手工补充' };
  const data = decrypt(record.payloadEncrypted, null);
  if (!data) return { status: 'failed', data: null, source: record.source, failureReason: '共享数据暂不可用，请手工补充' };
  return { status: 'success', data, source: record.source, failureReason: null };
};
