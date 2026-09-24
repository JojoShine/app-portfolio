const db = require('../db');
const files = require('../../../system/file').service;
const { ValidationError } = require('../../../common/utils/error');
exports.owned = async (fileIds, userId, client = db) => {
  const rows = await client.file.findMany({ where: { id: { in: fileIds }, uploadedBy: userId, isPublic: false, fileType: 'image' } });
  if (rows.length !== fileIds.length || rows.some((file) => file.size > 2 * 1024 * 1024)) throw new ValidationError('照片不存在、不属于当前用户或尺寸过大，请重新上传');
  return fileIds.map((id) => rows.find((row) => row.id === id));
};
exports.upload = (file, userId) => {
  if (!file || file.mimetype !== 'image/jpeg') throw new ValidationError('请上传有效的照片');
  return files.uploadFile(file, userId);
};
exports.read = async (id, userId) => {
  await exports.owned([id], userId);
  const { stream, mimeType } = await files.getFileStream(id, { id: userId, roles: [] });
  const chunks = [];
  let size = 0;
  for await (const chunk of stream) {
    size += chunk.length;
    if (size > 2 * 1024 * 1024) { stream.destroy(); throw new ValidationError('照片过大'); }
    chunks.push(chunk);
  }
  return `data:${mimeType};base64,${Buffer.concat(chunks).toString('base64')}`;
};
