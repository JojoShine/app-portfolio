const File = require('./model');
const minioClient = require('../../config/minio');
const logger = require('../../common/utils/logger');
const { NotFoundError, InternalServerError } = require('../../common/utils/error');
const { v4: uuidv4 } = require('uuid');

// 上传文件到 MinIO
const uploadFile = async (file, uploadedBy = null) => {
  try {
    const env = require('../../config/env');
    const fileId = uuidv4();
    const timestamp = Date.now();
    const fileType = file.fileType || 'other';

    // 生成文件路径：module/timestamp-uuid.ext
    const ext = file.originalname.split('.').pop();
    const filename = `${timestamp}-${fileId}.${ext}`;
    const filePath = `${fileType}/${filename}`;

    // 上传到 MinIO
    await minioClient.putObject(
      env.MINIO_BUCKET,
      filePath,
      file.buffer,
      file.size,
      {
        'Content-Type': file.mimetype,
      }
    );

    // 保存文件元数据到数据库
    const fileRecord = await File.create({
      filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: filePath,
      fileType,
      uploadedBy,
      isPublic: false,
    });

    logger.info('File uploaded successfully', {
      fileId: fileRecord.id,
      filename,
      size: file.size,
    });

    return fileRecord;
  } catch (error) {
    logger.error('File upload failed', {
      filename: file.originalname,
      error: error.message,
    });
    throw new InternalServerError('File upload failed');
  }
};

// 获取文件流
const getFileStream = async (fileId) => {
  try {
    const fileRecord = await File.findByPk(fileId);
    if (!fileRecord) {
      throw new NotFoundError('File not found');
    }

    const env = require('../../config/env');

    // 从 MinIO 获取文件流
    const stream = await minioClient.getObject(
      env.MINIO_BUCKET,
      fileRecord.path
    );

    logger.info('File stream retrieved', {
      fileId,
      filename: fileRecord.filename,
    });

    return {
      stream,
      mimeType: fileRecord.mimeType,
      filename: fileRecord.originalName,
      size: fileRecord.size,
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Failed to get file stream', {
      fileId,
      error: error.message,
    });
    throw new InternalServerError('Failed to retrieve file');
  }
};

// 删除文件
const deleteFile = async (fileId) => {
  try {
    const fileRecord = await File.findByPk(fileId);
    if (!fileRecord) {
      throw new NotFoundError('File not found');
    }

    const env = require('../../config/env');

    // 从 MinIO 删除文件
    await minioClient.removeObject(env.MINIO_BUCKET, fileRecord.path);

    // 从数据库删除记录
    await fileRecord.destroy();

    logger.info('File deleted successfully', {
      fileId,
      filename: fileRecord.filename,
    });

    return true;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Failed to delete file', {
      fileId,
      error: error.message,
    });
    throw new InternalServerError('Failed to delete file');
  }
};

// 获取文件列表
const getFileList = async (page = 1, pageSize = 10, filters = {}) => {
  try {
    const offset = (page - 1) * pageSize;
    const { count, rows } = await File.findAndCountAll({
      where: filters,
      offset,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
    });

    return {
      items: rows,
      total: count,
      page,
      pageSize,
    };
  } catch (error) {
    logger.error('Failed to get file list', { error: error.message });
    throw error;
  }
};

module.exports = {
  uploadFile,
  getFileStream,
  deleteFile,
  getFileList,
};