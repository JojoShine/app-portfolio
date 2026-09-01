const express = require('express');
const userController = require('../controllers/user.controller');
const { requireAuth, requireRole } = require('../../../common/middleware/authorize');

const router = express.Router();
router.use(requireAuth, requireRole('admin'));
router.post('/', userController.createUser);
router.get('/', userController.getUserList);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
