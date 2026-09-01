const response = require('../../../common/response');
const { validateUploadFile, validateGetFileStream } = require('../validations/file.validation');
const fileService = require('../services/file.service');
const { parsePagination } = require('../../../common/utils/pagination');

const uploadFile = async (req, res, next) => {
  try {
    validateUploadFile(req.file);
    const file = await fileService.uploadFile(req.file, req.user?.id);
    res.status(201).json(response.success(file, 'File uploaded successfully'));
  } catch (error) {
    next(error);
  }
};

const getFileStream = async (req, res, next) => {
  try {
    const fileIdentifier = req.fileIdentifier || req.params.id;
    validateGetFileStream(fileIdentifier);
    const fileData = await fileService.getFileStream(fileIdentifier, req.user);

    res.setHeader('Content-Type', fileData.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileData.filename)}"`);
    fileData.stream.pipe(res);
  } catch (error) {
    next(error);
  }
};

const deleteFile = async (req, res, next) => {
  try {
    await fileService.deleteFile(req.params.id, req.user);
    res.json(response.success(null, 'File deleted successfully'));
  } catch (error) {
    next(error);
  }
};

const getFileList = async (req, res, next) => {
  try {
    const { page, pageSize } = parsePagination(req.query);
    const filters = {};
    if (req.query.fileType) filters.fileType = req.query.fileType;
    if (req.query.isPublic !== undefined) filters.isPublic = req.query.isPublic === 'true';

    const result = await fileService.getFileList(page, pageSize, filters, req.user);
    res.json(response.list(result.items, result.total, result.page, result.pageSize));
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadFile, getFileStream, deleteFile, getFileList };
