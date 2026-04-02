const express = require('express');

const { getBanners, getBannerImage, upsertBanner } = require('../controllers/banner.controller');
const { protect, admin } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

const router = express.Router();

// Lấy cấu hình banner trang chủ.
router.get('/', getBanners);
// Lấy ảnh banner theo vị trí.
router.get('/:position/image', getBannerImage);
// Tạo mới hoặc cập nhật ảnh banner (admin).
router.put('/:position', protect, admin, upload.single('image'), upsertBanner);

module.exports = router;
