const response = require('../../common/response');
const { app: logger } = require('../../common/utils/logger');
const { validateUploadFile, validateGetFileStream } = require('./validation');
const fileService = require('./service');

// 上传文件
const uploadFile = async (req, res, next) => {
  try {
    validateUploadFile(req.file);
    const file = await fileService.uploadFile(req.file, req.user?.id);
    res.status(201).json(response.success(file, 'File uploaded successfully'));
  } catch (error) {
    next(error);
  }
};

// 获取文件流（用于展示图片等）
const getFileStream = async (req, res, next) => {
  try {
    const fileIdentifier = req.fileIdentifier || req.params.id;
    validateGetFileStream(fileIdentifier);
    const fileData = await fileService.getFileStream(fileIdentifier);

    // 设置响应头
    res.setHeader('Content-Type', fileData.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(fileData.filename)}"`
    );

    // 返回文件流
    fileData.stream.pipe(res);
  } catch (error) {
    next(error);
  }
};

// 删除文件
const deleteFile = async (req, res, next) => {
  try {
    await fileService.deleteFile(req.params.id);
    res.json(response.success(null, 'File deleted successfully'));
  } catch (error) {
    next(error);
  }
};

// 获取文件列表
const getFileList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const filters = {};

    if (req.query.fileType) {
      filters.fileType = req.query.fileType;
    }

    if (req.query.isPublic !== undefined) {
      filters.isPublic = req.query.isPublic === 'true';
    }

    const result = await fileService.getFileList(page, pageSize, filters);
    res.json(response.list(result.items, result.total, result.page, result.pageSize));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadFile,
  getFileStream,
  deleteFile,
  getFileList,
};