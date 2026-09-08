const { Prisma } = require('@prisma/client');
const database = require('../db');
const enrollmentApplication = database.enrollmentApplication;
const enrollmentPublication = database.enrollmentPublication;
const { decrypt, digest, maskName, maskIdNumber } = require('../utils/crypto');
const { NotFoundError, ConflictError } = require('../../../common/utils/error');
const {
  withSerializableTransaction,
  audit,
  getActiveSeason,
} = require('./enrollment.shared');

const setPublication = async (type, actorId, input, context = {}) => withSerializableTransaction(async (transaction) => {
  const season = await getActiveSeason(transaction);
  if (type === 'final' && input.published) {
    const pendingAdmissions = await transaction.enrollmentApplication.count({
      where: { seasonId: season.id, status: 'initial_approved' },
    });
    if (pendingAdmissions > 0) {
      throw new ConflictError('仍有初审通过的报名未完成补录，暂不能发布最终录取结果');
    }
  }
  const publicationData = {
    published: input.published,
    publishedAt: input.published ? new Date() : null,
    arrangement: input.arrangement == null ? Prisma.DbNull : input.arrangement,
    updatedBy: actorId,
  };
  const publication = await transaction.enrollmentPublication.upsert({
    where: { seasonId_type: { seasonId: season.id, type } },
    create: { seasonId: season.id, type, ...publicationData },
    update: publicationData,
  });
  if (type === 'initial' && input.arrangement) {
    await transaction.enrollmentApplication.updateMany({
      where: { seasonId: season.id, status: { in: ['initial_approved', 'admitted'] } },
      data: { offlineArrangement: input.arrangement, hasUpdate: true },
    });
  }
  await audit(`publication.${input.published ? 'published' : 'withdrawn'}`, actorId, {
    requestId: context.requestId,
    transaction,
    details: { type, seasonId: season.id },
  });
  return publication;
}, { isolationLevel: 'Serializable' });

const getPublicationStatus = async (type) => {
  const season = await getActiveSeason();
  const publication = await enrollmentPublication.findUnique({
    where: { seasonId_type: { seasonId: season.id, type } },
  });
  return {
    type,
    published: Boolean(publication?.published),
    publishedAt: publication?.publishedAt || null,
  };
};

const recordPublicQueryAttempt = (type, outcome, context = {}) => audit(
  'publication.public_query_attempt',
  'public',
  { requestId: context.requestId, details: { type, outcome } }
);

const publicQuery = async (type, input, context = {}) => {
  const season = await getActiveSeason();
  const publication = await enrollmentPublication.findFirst({
    where: { seasonId: season.id, type, published: true },
  });
  if (!publication) throw new ConflictError('公示结果暂未发布');
  const allowedStatuses = type === 'initial' ? ['initial_approved', 'admitted'] : ['admitted'];
  const application = await enrollmentApplication.findFirst({
    where: {
      seasonId: season.id,
      studentNameHash: digest(input.studentName),
      studentIdLastSixHash: digest(input.studentIdLastSix),
      status: { in: allowedStatuses },
    },
    include: { school: true },
    orderBy: { createdAt: 'desc' },
  });
  if (!application) throw new NotFoundError('未查询到匹配结果或信息有误');
  const studentName = decrypt(application.studentNameEncrypted, '');
  const studentIdNumber = decrypt(application.studentIdEncrypted, '');
  const base = {
    studentName: maskName(studentName),
    studentIdNumber: maskIdNumber(studentIdNumber),
    year: season.year,
    type,
  };
  const result = type === 'initial'
    ? {
      ...base,
      result: '初审通过',
      offlineArrangement: application.offlineArrangement || publication.arrangement || {
        status: 'pending',
        message: '线下审核安排待公布',
      },
    }
    : {
      ...base,
      result: '已录取',
      schoolName: application.admittedSchoolName,
    };
  await audit('publication.public_query_matched', 'public', {
    applicationId: application.id,
    requestId: context.requestId,
    details: { type },
  });
  return result;
};

module.exports = {
  setPublication,
  getPublicationStatus,
  recordPublicQueryAttempt,
  publicQuery,
};
