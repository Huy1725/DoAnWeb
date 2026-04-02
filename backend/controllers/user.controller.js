const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

// Tạo user mới từ trang quản trị.
const createUser = async (req, res) => {
  try {
    const { name, email, password, isAdmin } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ tên, email và mật khẩu' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isAdmin: Boolean(isAdmin),
    });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
};

// Lấy danh sách user (ẩn password).
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

// Xóa user theo id, chặn xóa tài khoản admin.
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isAdmin) {
      return res.status(400).json({ message: 'Không thể xóa tài khoản Admin' });
    }

    await user.deleteOne();
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

// Cập nhật quyền admin của user.
const updateUserRole = async (req, res) => {
  try {
    const { isAdmin } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (String(req.user._id) === String(user._id) && !Boolean(isAdmin)) {
      return res.status(400).json({ message: 'Không thể tự gỡ quyền Admin của chính bạn' });
    }

    user.isAdmin = Boolean(isAdmin);
    await user.save();

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update user role', error: error.message });
  }
};

module.exports = {
  createUser,
  getUsers,
  deleteUser,
  updateUserRole,
};
