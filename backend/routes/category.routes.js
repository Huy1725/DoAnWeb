const express = require('express');

const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller');
const { protect, admin } = require('../middleware/auth.middleware');

const router = express.Router();

// Lấy danh sách danh mục.
router.get('/', getCategories);
// Tạo danh mục mới (admin).
router.post('/', protect, admin, createCategory);
// Cập nhật danh mục theo id (admin).
router.put('/:id', protect, admin, updateCategory);
// Xóa danh mục theo id (admin).
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;
