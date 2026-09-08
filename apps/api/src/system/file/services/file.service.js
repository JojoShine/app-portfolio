const crypto = require('crypto');
const database = require('../../../config/database');
const fileStorage = require('../../../config/minio');
const { app: logger } = require('../../../common/utils/logger');
const {
  ApiError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
  InternalServerError,
} = require('../../../common/utils/error');
const FILE_SELECT = Object.freeze({
  id: true,
  filename: true,
  originalName: true,
  mimeType: true,
  size: true,
  path: true,
  fileType: true,
  uploadedBy: true,
  isPublic: true,
  createdAt: true,
  updatedAt: true,
});

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const normalizeFileType = (file) => {
  if (file.mimetype?.startsWith('image/')) return 'image';
  if (file.mimetype?.startsWith('video/')) return 'video';
  if (file.mimetype?.startsWith('audio/')) return 'audio';
  if (file.fileType === 'document' || file.mimetype?.startsWith('application/')) return 'document';
  return 'other';
};

const canAccessFile = (fileRecord, requester) => (
  fileRecord.isPublic
  || fileRecord.uploadedBy === requester?.id
  || requester?.roles?.includes('admin')
);

const uploadFile = async (file, uploadedBy = null) => {
  const minioClient = fileStorage.getMinioClient();
  let filePath;
  let persisted = false;

  try {
    await fileStorage.ensurePrivateBucket();
    const fileId = crypto.randomUUID();
    const timestamp = Date.now();
    const fileType = normalizeFileType(file);
    const extension = file.originalname.includes('.') ? file.originalname.split('.').pop() : 'bin';
    const filename = `${timestamp}-${fileId}.${extension}`;
    filePath = `${fileType}/${filename}`;

    await minioClient.putObject(fileStorage.bucket, filePath, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });

    const fileRecord = await database.file.create({
      data: {
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: filePath,
        fileType,
        uploadedBy,
        isPublic: false,
      },
      select: FILE_SELECT,
    });
    persisted = true;

    logger.info('File uploaded successfully', {
      fileId: fileRecord.id,
      filename,
      size: file.size,
    });
    return fileRecord;
  } catch (error) {
    if (filePath && !persisted) {
      await minioClient.removeObject(fileStorage.bucket, filePath).catch(() => null);
    }
    if (error instanceof ApiError) throw error;
    logger.error('File upload failed', {
      filename: file.originalname,
      error: error.message,
    });
    throw new InternalServerError('File upload failed');
  }
};

const getFileStream = async (fileIdOrPath, requester) => {
  try {
    const minioClient = fileStorage.getMinioClient();
    await fileStorage.ensurePrivateBucket();
    const fileRecord = UUID_PATTERN.test(fileIdOrPath)
      ? await database.file.findUnique({ where: { id: fileIdOrPath }, select: FILE_SELECT })
      : await database.file.findUnique({ where: { path: fileIdOrPath }, select: FILE_SELECT });

    if (!fileRecord) throw new NotFoundError('File not found');
    if (!canAccessFile(fileRecord, requester)) throw new ForbiddenError('File access denied');

    const stream = await minioClient.getObject(fileStorage.bucket, fileRecord.path);
    logger.info('File stream retrieved', { filePath: fileRecord.path });

    return {
      stream,
      mimeType: fileRecord.mimeType,
      filename: fileRecord.originalName,
      size: fileRecord.size,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('Failed to get file stream', { fileIdOrPath, error: error.message });
    throw new InternalServerError('Failed to retrieve file');
  }
};

const deleteFile = async (fileId, requester) => {
  try {
    const minioClient = fileStorage.getMinioClient();
    await fileStorage.ensurePrivateBucket();

    const fileRecord = await database.$transaction(async (transaction) => {
      const record = await transaction.file.findUnique({
        where: { id: fileId },
        select: FILE_SELECT,
      });
      if (!record) throw new NotFoundError('File not found');
      if (!canAccessFile(record, requester)) throw new ForbiddenError('File access denied');

      await transaction.file.delete({ where: { id: fileId } });
      return record;
    });

    await minioClient.removeObject(fileStorage.bucket, fileRecord.path).catch((error) => {
      logger.warn('File metadata deleted but object cleanup failed', {
        fileId,
        filePath: fileRecord.path,
        error: error.message,
      });
    });

    logger.info('File deleted successfully', {
      fileId,
      filename: fileRecord.filename,
    });
    return true;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error.code === 'P2003') throw new ConflictError('File is still referenced');
    if (error.code === 'P2025') throw new NotFoundError('File not found');
    logger.error('Failed to delete file', { fileId, error: error.message });
    throw new InternalServerError('Failed to delete file');
  }
};

const getFileList = async (page = 1, pageSize = 10, filters = {}, requester) => {
  try {
    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.min(100, Math.max(1, Number(pageSize) || 10));
    const isAdmin = requester?.roles?.includes('admin');
    const where = isAdmin ? filters : { ...filters, uploadedBy: requester.id };
    const skip = (safePage - 1) * safePageSize;
    const [items, total] = await database.$transaction([
      database.file.findMany({
        where,
        skip,
        take: safePageSize,
        orderBy: { createdAt: 'desc' },
        select: FILE_SELECT,
      }),
      database.file.count({ where }),
    ]);

    return { items, total, page: safePage, pageSize: safePageSize };
  } catch (error) {
    logger.error('Failed to get file list', { error: error.message });
    throw error;
  }
};

module.exports = { uploadFile, getFileStream, deleteFile, getFileList, canAccessFile };
