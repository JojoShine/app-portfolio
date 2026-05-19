const express = require('express');
const router = express.Router();
const { upload, processFile } = require('../../common/middleware/upload');
const fileController = require('./controller');

// 上传文件
router.post('/', upload.single('file'), processFile, fileController.uploadFile);

// 获取文件列表
router.get('/', fileController.getFileList);

// 获取文件流（用于展示图片等）
router.get('/stream/:id', fileController.getFileStream);

// 删除文件
router.delete('/:id', fileController.deleteFile);

module.exports = router;