const express = require('express');

const {
  createPromotion,
  getPromotions,
  updatePromotionStatus,
} = require('../controllers/promotion.controller');
const { protect, admin } = require('../middleware/auth.middleware');

const router = express.Router();

// Lay danh sach voucher cho admin.
router.get('/', protect, admin, getPromotions);
// Tao voucher moi.
router.post('/', protect, admin, createPromotion);
// Bat/tat voucher.
router.patch('/:id/status', protect, admin, updatePromotionStatus);

module.exports = router;
