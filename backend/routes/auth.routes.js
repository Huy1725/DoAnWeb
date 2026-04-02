const express = require('express');

const {
	registerUser,
	loginUser,
	getUsers,
	deleteUser,
	makeAdmin,
} = require('../controllers/auth.controller');
const { protect, admin } = require('../middleware/auth.middleware');

const router = express.Router();

// Đăng ký tài khoản người dùng.
router.post('/register', registerUser);
// Đăng nhập và nhận JWT.
router.post('/login', loginUser);
// Lấy danh sách user (admin).
router.get('/', protect, admin, getUsers);
// Xóa user theo id (admin).
router.delete('/:id', protect, admin, deleteUser);
// Cấp quyền admin cho user (admin).
router.patch('/:id/admin', protect, admin, makeAdmin);

module.exports = router;
