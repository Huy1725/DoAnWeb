const express = require('express');

const {
	createUser,
	getUsers,
	deleteUser,
	updateUserRole,
	getMyProfile,
	getMyNotifications,
	markMyNotificationsRead,
	getMyVouchers,
	updateMyAvatar,
	getUserAvatar,
} = require('../controllers/user.controller');
const { protect, admin } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

const router = express.Router();

// Lấy hồ sơ user hiện tại.
router.get('/me/profile', protect, getMyProfile);
// Lấy thông báo của user hiện tại.
router.get('/me/notifications', protect, getMyNotifications);
// Đánh dấu tất cả thông báo đã đọc.
router.put('/me/notifications/read-all', protect, markMyNotificationsRead);
// Lấy danh sách voucher của user hiện tại.
router.get('/me/vouchers', protect, getMyVouchers);
// Upload/cập nhật avatar user hiện tại.
router.put('/me/avatar', protect, upload.single('avatar'), updateMyAvatar);
// Lấy avatar theo user id.
router.get('/:id/avatar', getUserAvatar);

// Tạo user mới từ trang quản trị.
router.post('/', protect, admin, createUser);
// Lấy danh sách user (admin).
router.get('/', protect, admin, getUsers);
// Xóa user theo id (admin).
router.delete('/:id', protect, admin, deleteUser);
// Cập nhật role user theo id (admin).
router.put('/:id/role', protect, admin, updateUserRole);

module.exports = router;
