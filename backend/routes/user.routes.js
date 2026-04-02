const express = require('express');

const { createUser, getUsers, deleteUser, updateUserRole } = require('../controllers/user.controller');
const { protect, admin } = require('../middleware/auth.middleware');

const router = express.Router();

// Tạo user mới từ trang quản trị.
router.post('/', protect, admin, createUser);
// Lấy danh sách user (admin).
router.get('/', protect, admin, getUsers);
// Xóa user theo id (admin).
router.delete('/:id', protect, admin, deleteUser);
// Cập nhật role user theo id (admin).
router.put('/:id/role', protect, admin, updateUserRole);

module.exports = router;
