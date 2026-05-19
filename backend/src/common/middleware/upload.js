const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const logger = require('../utils/logger');
const { ValidationError } = require('../utils/error');

// 允许的文件类型
const ALLOWED_MIME_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  all: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

// 文件大小限制（字节）
const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10MB
  document: 50 * 1024 * 1024, // 50MB
  default: 10 * 1024 * 1024, // 10MB
};

// 配置 multer 存储
const storage = multer.memoryStorage();

// 文件过滤器
const fileFilter = (req, file, cb) => {
  const allowedTypes = ALLOWED_MIME_TYPES.all;

  if (!allowedTypes.includes(file.mimetype)) {
    logger.warn('Invalid file type', { mimetype: file.mimetype, filename: file.originalname });
    return cb(new ValidationError(`File type not allowed: ${file.mimetype}`));
  }

  cb(null, true);
};

// 创建 multer 实例
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: FILE_SIZE_LIMITS.default,
  },
});

// 文件处理中间件（压缩、验证等）
const processFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const file = req.file;
    const fileSize = file.size;
    const mimeType = file.mimetype;

    // 验证文件大小
    const sizeLimit = FILE_SIZE_LIMITS.default;
    if (fileSize > sizeLimit) {
      logger.warn('File size exceeds limit', { filename: file.originalname, size: fileSize, limit: sizeLimit });
      throw new ValidationError(`File size exceeds limit: ${sizeLimit / 1024 / 1024}MB`);
    }

    // 如果是图片，进行压缩
    if (mimeType.startsWith('image/')) {
      try {
        const compressedBuffer = await sharp(file.buffer)
          .resize(2000, 2000, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: 80, progressive: true })
          .toBuffer();

        // 更新文件信息
        req.file.buffer = compressedBuffer;
        req.file.size = compressedBuffer.length;
        req.file.compressed = true;

        logger.debug('Image compressed', {
          filename: file.originalname,
          originalSize: fileSize,
          compressedSize: compressedBuffer.length,
        });
      } catch (error) {
        logger.error('Image compression failed', { error: error.message, filename: file.originalname });
        throw new ValidationError('Image compression failed');
      }
    }

    // 添加文件信息到 req
    req.file.uploadedAt = new Date();
    req.file.fileType = mimeType.split('/')[0]; // 'image', 'application', etc.

    next();
  } catch (error) {
    next(error);
  }
};

// 导出中间件
module.exports = {
  upload,
  processFile,
  ALLOWED_MIME_TYPES,
  FILE_SIZE_LIMITS,
};
