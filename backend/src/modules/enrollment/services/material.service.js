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
  saveVersion,
} = require('./enrollment.shared');

const addMaterial = async (id, userId, input, context = {}) => withSerializableTransaction(async (transaction) => {
  const application = await getOwnedApplication(id, userId, { transaction });
  requireEditable(application);
  const file = await transaction.file.findUnique({ where: { id: input.fileId } });
  if (!file || file.uploadedBy !== userId) throw new NotFoundError('图片不存在');
  if (!file.mimeType.startsWith('image/')) throw new ValidationError('报名材料仅支持图片');
  const count = await transaction.enrollmentMaterial.count({
    where: { applicationId: id, itemCode: input.itemCode, deletedAt: null },
  });
  if (count >= 10) throw new ValidationError('每个材料项最多上传 10 张图片');
  const existing = await transaction.enrollmentMaterial.findFirst({
    where: { fileId: input.fileId, deletedAt: null },
  });
  if (existing) throw new ConflictError('该图片已关联报名材料');
  const material = await transaction.enrollmentMaterial.create({ data: {
    applicationId: id,
    fileId: input.fileId,
    itemCode: input.itemCode,
    sort: input.sort,
  } });
  await updateRecord(transaction.enrollmentApplication, application, {
    draftVersion: application.draftVersion + 1,
  });
  await saveVersion(application, 'material_added', userId, transaction);
  await audit('application.material_added', userId, {
    applicationId: id,
    requestId: context.requestId,
    transaction,
    details: { materialId: material.id, itemCode: input.itemCode },
  });
  return { id: material.id, fileId: material.fileId, itemCode: material.itemCode, sort: material.sort, version: application.draftVersion };
}, { isolationLevel: 'Serializable' });

const removeMaterial = async (id, materialId, userId, context = {}) => withSerializableTransaction(async (transaction) => {
  const application = await getOwnedApplication(id, userId, { transaction });
  requireEditable(application);
  const material = await transaction.enrollmentMaterial.findFirst({
    where: { id: materialId, applicationId: id, deletedAt: null },
  });
  if (!material) throw new NotFoundError('材料不存在');
  await updateRecord(transaction.enrollmentMaterial, material, { deletedAt: new Date() });
  await updateRecord(transaction.enrollmentApplication, application, {
    draftVersion: application.draftVersion + 1,
  });
  await saveVersion(application, 'material_removed', userId, transaction);
  await audit('application.material_removed', userId, {
    applicationId: id,
    requestId: context.requestId,
    transaction,
    details: { materialId },
  });
  return { version: application.draftVersion };
}, { isolationLevel: 'Serializable' });

const reorderMaterials = async (id, userId, items, context = {}) => withSerializableTransaction(async (transaction) => {
  const application = await getOwnedApplication(id, userId, { transaction });
  requireEditable(application);
  const materialIds = items.map((item) => item.id);
  const materials = await transaction.enrollmentMaterial.findMany({
    where: { id: { in: materialIds }, applicationId: id, deletedAt: null },
  });
  if (materials.length !== new Set(materialIds).size) throw new ValidationError('材料排序数据不属于当前报名');
  const sortMap = new Map(items.map((item) => [item.id, item.sort]));
  await Promise.all(materials.map((material) => updateRecord(
    transaction.enrollmentMaterial,
    material,
    { sort: sortMap.get(material.id) }
  )));
  await updateRecord(transaction.enrollmentApplication, application, {
    draftVersion: application.draftVersion + 1,
  });
  await saveVersion(application, 'materials_reordered', userId, transaction);
  await audit('application.materials_reordered', userId, {
    applicationId: id,
    requestId: context.requestId,
    transaction,
    details: { materialIds },
  });
  return { version: application.draftVersion };
}, { isolationLevel: 'Serializable' });

module.exports = {
  addMaterial,
  removeMaterial,
  reorderMaterials,
};

