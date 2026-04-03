const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user.model');

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Tạo JWT dùng cho đăng nhập/đăng ký thành công.
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Đăng ký tài khoản mới, hash mật khẩu và trả về token.
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to register user',
      error: error.message,
    });
  }
};

// Đăng nhập bằng email hoặc tên đăng nhập và trả về thông tin user + token.
const loginUser = async (req, res) => {
  try {
    const { identifier, email, password } = req.body;

    const normalizedIdentifier = String(identifier || email || '').trim();

    if (!normalizedIdentifier || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập tên đăng nhập/email và mật khẩu' });
    }

    const identifierRegex = new RegExp(`^${escapeRegex(normalizedIdentifier)}$`, 'i');

    const user = await User.findOne({
      $or: [{ email: normalizedIdentifier.toLowerCase() }, { name: identifierRegex }],
    });

    if (!user) {
      return res.status(401).json({ message: 'Sai tên đăng nhập/email hoặc mật khẩu' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Sai tên đăng nhập/email hoặc mật khẩu' });
    }

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to login',
      error: error.message,
    });
  }
};

// Lấy danh sách user cho admin (ẩn trường password).
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

// Xóa user theo id (không cho admin tự xóa chính mình).
const deleteUser = async (req, res) => {
  try {
    if (String(req.user._id) === String(req.params.id)) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

// Cấp quyền admin cho user theo id.
const makeAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isAdmin = true;
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
  registerUser,
  loginUser,
  getUsers,
  deleteUser,
  makeAdmin,
};
