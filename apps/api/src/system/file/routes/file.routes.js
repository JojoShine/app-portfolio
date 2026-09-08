const express = require('express');
const { upload, processFile } = require('../../../common/middleware/upload');
const fileController = require('../controllers/file.controller');
const { requireAuth } = require('../../../common/middleware/authorize');

const router = express.Router();
router.use(requireAuth);
router.post('/', upload.single('file'), processFile, fileController.uploadFile);
router.get('/', fileController.getFileList);
router.delete('/:id', fileController.deleteFile);
router.get('/*filePath', (req, res, next) => {
  req.fileIdentifier = Array.isArray(req.params.filePath)
    ? req.params.filePath.join('/')
    : req.params.filePath;
  fileController.getFileStream(req, res, next);
});

module.exports = router;
