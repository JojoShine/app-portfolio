const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const { app: logger } = require('../utils/logger');
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
const COMPRESSED_IMAGE_LIMIT = 2 * 1024 * 1024;

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
        let compressedBuffer;
        const attempts = [
          { width: 2000, quality: 82 },
          { width: 1800, quality: 72 },
          { width: 1600, quality: 62 },
          { width: 1400, quality: 52 },
        ];
        for (const attempt of attempts) {
          compressedBuffer = await sharp(file.buffer)
            .rotate()
            .resize(attempt.width, attempt.width, {
              fit: 'inside',
              withoutEnlargement: true,
            })
            .flatten({ background: '#ffffff' })
            .jpeg({ quality: attempt.quality, progressive: true, mozjpeg: true })
            .toBuffer();
          if (compressedBuffer.length <= COMPRESSED_IMAGE_LIMIT) break;
        }
        if (compressedBuffer.length > COMPRESSED_IMAGE_LIMIT) {
          throw new ValidationError('图片压缩后仍过大，请选择更清晰且尺寸较小的图片');
        }

        // 更新文件信息
        req.file.buffer = compressedBuffer;
        req.file.size = compressedBuffer.length;
        req.file.mimetype = 'image/jpeg';
        req.file.originalname = `${path.parse(file.originalname).name}.jpg`;
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
  COMPRESSED_IMAGE_LIMIT,
};
