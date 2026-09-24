const { withSerializableTransaction, getOwnedApplication, audit } = require('./enrollment.shared');
const { ConflictError } = require('../../../common/utils/error');

exports.discard = (id, userId, context) => withSerializableTransaction(async (transaction) => {
  const application = await getOwnedApplication(id, userId, { transaction });
  if (application.status !== 'draft') throw new ConflictError('只有待提交的报名草稿可以删除');
  await transaction.enrollmentApplication.update({ where: { id }, data: { status: 'discarded', draftVersion: { increment: 1 } } });
  await audit('application.draft_discarded', userId, { applicationId: id, requestId: context.requestId, transaction });
  return null;
}, { isolationLevel: 'Serializable' });
