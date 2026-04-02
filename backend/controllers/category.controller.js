const Category = require('../models/category.model');

// Lấy toàn bộ danh mục, sắp xếp mới nhất trước.
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
};

// Tạo danh mục mới và kiểm tra trùng tên.
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.create({ name });
    return res.status(201).json(category);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Danh mục đã tồn tại' });
    }

    return res.status(500).json({ message: error.message || 'Failed to create category' });
  }
};

// Cập nhật tên danh mục theo id.
const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.status(200).json(category);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Danh mục đã tồn tại' });
    }

    return res.status(500).json({ message: error.message || 'Failed to update category' });
  }
};

// Xóa danh mục theo id.
const deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);

    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete category', error: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
