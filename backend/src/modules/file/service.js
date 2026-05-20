const File = require('./model');
const minioClient = require('../../config/minio');
const logger = require('../../common/utils/logger');
const { NotFoundError, InternalServerError } = require('../../common/utils/error');
const { v4: uuidv4 } = require('uuid');

// 上传文件到 MinIO
const uploadFile = async (file, uploadedBy = null) => {
  try {
    const fileId = uuidv4();
    const timestamp = Date.now();
    const fileType = file.fileType || 'other';

    // 生成文件路径：module/timestamp-uuid.ext
    const ext = file.originalname.split('.').pop();
    const filename = `${timestamp}-${fileId}.${ext}`;
    const filePath = `${fileType}/${filename}`;

    // 上传到 MinIO
    await minioClient.putObject(
      minioClient.bucket,
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

// 获取文件流（支持fileId和path两种方式）
const getFileStream = async (fileIdOrPath) => {
  try {
    let filePath;
    let mimeType = 'application/octet-stream';
    let filename = 'file';
    let size = 0;

    // 判断是fileId还是path
    // 如果是UUID格式，则认为是fileId；否则认为是path
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (uuidRegex.test(fileIdOrPath)) {
      // 根据fileId查找
      const fileRecord = await File.findByPk(fileIdOrPath);
      if (!fileRecord) {
        throw new NotFoundError('File not found');
      }
      filePath = fileRecord.path;
      mimeType = fileRecord.mimeType;
      filename = fileRecord.originalName;
      size = fileRecord.size;
    } else {
      // 直接使用path
      filePath = fileIdOrPath;
      filename = fileIdOrPath.split('/').pop();
    }

    // 从 MinIO 获取文件流
    const stream = await minioClient.getObject(
      minioClient.bucket,
      filePath
    );

    logger.info('File stream retrieved', {
      filePath,
    });

    return {
      stream,
      mimeType,
      filename,
      size,
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Failed to get file stream', {
      fileIdOrPath,
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

    // 从 MinIO 删除文件
    await minioClient.removeObject(minioClient.bucket, fileRecord.path);

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