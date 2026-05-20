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

// 获取文件流（支持fileId和path两种方式）
router.get('/:id', fileController.getFileStream);

module.exports = router;
