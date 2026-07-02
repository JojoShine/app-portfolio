const express = require('express');
const router = express.Router();
const { upload, processFile } = require('../../common/middleware/upload');
const fileController = require('./controller');

// 上传文件
router.post('/', upload.single('file'), processFile, fileController.uploadFile);

// 获取文件列表（必须在/:id之前）
router.get('/', fileController.getFileList);

// 删除文件
router.delete('/:id', fileController.deleteFile);

// 获取文件流（支持fileId和path两种方式，path可能包含多级目录）
router.get('/*filePath', (req, res, next) => {
  // Express 5 通配符参数返回的是数组，需要拼接成完整路径
  const filePath = Array.isArray(req.params.filePath)
    ? req.params.filePath.join('/')
    : req.params.filePath;
  req.fileIdentifier = filePath;
  fileController.getFileStream(req, res, next);
});

module.exports = router;
