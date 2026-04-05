const express = require('express');

const {
  createPromotion,
  getPromotions,
  updatePromotionStatus,
  assignVoucherToUser,
  getUserVouchersForAdmin,
  deleteAvailableUserVoucher,
} = require('../controllers/promotion.controller');
const { protect, admin } = require('../middleware/auth.middleware');

const router = express.Router();

// Lay danh sach voucher cho admin.
router.get('/', protect, admin, getPromotions);
// Tao voucher moi.
router.post('/', protect, admin, createPromotion);
// Bat/tat voucher.
router.patch('/:id/status', protect, admin, updatePromotionStatus);
// Admin phat voucher cho tai khoan duoc chon.
router.post('/assign-voucher', protect, admin, assignVoucherToUser);
// Admin xem danh sach voucher cua 1 tai khoan.
router.get('/user-vouchers', protect, admin, getUserVouchersForAdmin);
// Admin xoa voucher con kha dung cua tai khoan.
router.delete('/user-vouchers/:id', protect, admin, deleteAvailableUserVoucher);

module.exports = router;
