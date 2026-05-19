const { ValidationError } = require('../../common/utils/error');

// 上传文件验证
const validateUploadFile = (file) => {
  const errors = [];

  if (!file) {
    errors.push('file is required');
  } else {
    if (!file.originalname) {
      errors.push('file originalname is required');
    }
    if (!file.mimetype) {
      errors.push('file mimetype is required');
    }
    if (!file.size || file.size <= 0) {
      errors.push('file size must be greater than 0');
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('File validation failed', { errors });
  }

  return true;
};

// 获取文件流验证
const validateGetFileStream = (fileId) => {
  const errors = [];

  if (!fileId || typeof fileId !== 'string') {
    errors.push('fileId is required and must be a string');
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed', { errors });
  }

  return true;
};

module.exports = {
  validateUploadFile,
  validateGetFileStream,
};