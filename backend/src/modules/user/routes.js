const express = require('express');
const router = express.Router();
const userController = require('./controller');

// 创建用户
router.post('/', userController.createUser);

// 获取用户列表
router.get('/', userController.getUserList);

// 获取用户详情
router.get('/:id', userController.getUserById);

// 更新用户
router.put('/:id', userController.updateUser);

// 删除用户
router.delete('/:id', userController.deleteUser);

module.exports = router;