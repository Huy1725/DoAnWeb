const express = require('express');

const {
	getProducts,
	getProductById,
	createProduct,
	getProductImage,
	updateProduct,
	deleteProduct,
} = require('../controllers/product.controller');
const { protect, admin } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

const router = express.Router();

// Lấy danh sách sản phẩm theo bộ lọc.
router.get('/', getProducts);
// Tạo sản phẩm mới, hỗ trợ upload ảnh (admin).
router.post('/', protect, admin, upload.single('image'), createProduct);
// Lấy ảnh sản phẩm theo id.
router.get('/:id/image', getProductImage);
// Lấy chi tiết sản phẩm theo id.
router.get('/:id', getProductById);
// Cập nhật sản phẩm, hỗ trợ upload ảnh (admin).
router.put('/:id', protect, admin, upload.single('image'), updateProduct);
// Xóa sản phẩm theo id (admin).
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
