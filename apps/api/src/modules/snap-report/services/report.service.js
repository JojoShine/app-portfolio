const db = require('../db');
const photos = require('./photo.service');
const { NotFoundError, ValidationError, ConflictError } = require('../../../common/utils/error');
const include = { photos: { orderBy: { position: 'asc' }, select: { fileId: true } } };
const output = (row) => ({ id: row.id, status: '已提交', createdAt: row.createdAt, ...row.content, fileIds: row.photos.map((photo) => photo.fileId) });
exports.create = async (input, userId) => {
  const where = { userId_requestId: { userId, requestId: input.requestId } };
  const previous = await db.snapReport.findUnique({ where, include });
  const replay = (row) => {
    if (JSON.stringify(row.content) !== JSON.stringify(input.content) || row.photos.map((p) => p.fileId).join() !== input.fileIds.join()) {
      // JSONB 会重排字段，以逐字段比较确认重试内容。
      const same = Object.keys(input.content).every((key) => input.content[key] === row.content[key]);
      if (!same || row.photos.map((p) => p.fileId).join() !== input.fileIds.join()) throw new ConflictError('该提交已完成，请查看上报记录');
    }
    return output(row);
  };
  if (previous) return replay(previous);
  // 上报以用户确认的文字地址为准，坐标仅作辅助，不依赖地图服务二次校验。
  try {
    const record = await db.$transaction(async (tx) => {
      await photos.owned(input.fileIds, userId, tx);
      if (input.analysisId) {
        const analysis = await tx.snapAnalysis.findFirst({ where: { id: input.analysisId, userId } });
        if (!analysis || analysis.fileIds.join() !== input.fileIds.join()) throw new ValidationError('识别照片已变更，请重新识别或手动填写');
      }
      return tx.snapReport.create({ data: { userId, requestId: input.requestId, content: input.content, analysisId: input.analysisId,
        photos: { create: input.fileIds.map((fileId, position) => ({ fileId, position })) } }, include });
    });
    return output(record);
  } catch (error) {
    if (error.code === 'P2002') return replay(await db.snapReport.findUnique({ where, include }));
    throw error;
  }
};
exports.list = async ({ page }, userId) => {
  const where = { userId };
  const [rows, total] = await db.$transaction([
    db.snapReport.findMany({ where, include, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: (page - 1) * 10, take: 10 }),
    db.snapReport.count({ where }),
  ]);
  return { items: rows.map(output), total, page, pageSize: 10 };
};
exports.detail = async (id, userId) => {
  const row = await db.snapReport.findFirst({ where: { id, userId }, include });
  if (!row) throw new NotFoundError('上报记录不存在');
  return output(row);
};
