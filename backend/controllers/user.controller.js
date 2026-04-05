const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const Order = require('../models/order.model');
const UserVoucher = require('../models/userVoucher.model');
const Notification = require('../models/notification.model');
const { resolveMembershipTierBySpent } = require('../services/membership.service');

const AVATAR_PLACEHOLDER_URL =
  'https://placehold.co/160x160/e5e7eb/6b7280?text=Avatar';

const buildAvatarUrl = (user) => {
  if (!user?.avatarData) {
    return null;
  }

  return `/api/users/${user._id}/avatar`;
};

const normalizeVoucherStatus = (value = '') => {
  if (!value) {
    return null;
  }

  const normalizedValue = String(value).trim().toLowerCase();
  if (['available', 'used', 'expired'].includes(normalizedValue)) {
    return normalizedValue;
  }

  return null;
};

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
      membershipTier: user.membershipTier,
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

// Lấy thông tin hồ sơ user hiện tại + thống kê đơn hàng.
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [orders, vouchers, latestNotifications, unreadNotificationCount] = await Promise.all([
      Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean(),
      UserVoucher.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50).lean(),
      Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10).lean(),
      Notification.countDocuments({ user: req.user._id, isRead: false }),
    ]);

    const totalOrders = orders.length;
    const totalSpent = orders
      .filter((order) => String(order.status || '').toLowerCase() !== 'cancelled')
      .reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);

    const resolvedTier = resolveMembershipTierBySpent(totalSpent).code;

    if (user.membershipTier !== resolvedTier) {
      user.membershipTier = resolvedTier;
      await user.save();
    }

    return res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        membershipTier: user.membershipTier,
        createdAt: user.createdAt,
        avatarUrl: buildAvatarUrl(user),
      },
      stats: {
        totalOrders,
        totalSpent,
      },
      orders,
      vouchers,
      notifications: latestNotifications,
      unreadNotificationCount,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};

// Lay thong bao cua user hien tai.
const getMyNotifications = async (req, res) => {
  try {
    const requestedLimit = Math.floor(Number(req.query.limit || 20));
    const safeLimit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 50)
      : 20;

    const [notifications, unreadNotificationCount] = await Promise.all([
      Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(safeLimit).lean(),
      Notification.countDocuments({ user: req.user._id, isRead: false }),
    ]);

    return res.status(200).json({
      notifications,
      unreadNotificationCount,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to fetch notifications', error: error.message });
  }
};

// Danh dau toan bo thong bao la da doc.
const markMyNotificationsRead = async (req, res) => {
  try {
    const updateResult = await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json({
      message: 'Notifications updated',
      updatedCount: updateResult.modifiedCount || 0,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to update notifications', error: error.message });
  }
};

// Lay danh sach voucher cua user hien tai.
const getMyVouchers = async (req, res) => {
  try {
    const statusFilter = normalizeVoucherStatus(req.query.status);
    const query = { user: req.user._id };

    if (statusFilter) {
      query.status = statusFilter;
    }

    const vouchers = await UserVoucher.find(query).sort({ createdAt: -1 }).lean();
    return res.status(200).json(vouchers);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch vouchers', error: error.message });
  }
};

// Upload hoặc thay đổi avatar cho user hiện tại.
const updateMyAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn ảnh avatar để tải lên' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.avatarData = req.file.buffer;
    user.avatarContentType = req.file.mimetype;
    await user.save();

    return res.status(200).json({
      message: 'Cập nhật avatar thành công',
      avatarUrl: buildAvatarUrl(user),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update avatar', error: error.message });
  }
};

// Lấy ảnh avatar theo user id, fallback về ảnh mặc định nếu chưa có.
const getUserAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('avatarData avatarContentType');

    if (user?.avatarData) {
      res.set('Content-Type', user.avatarContentType || 'image/png');
      return res.send(user.avatarData);
    }

    return res.redirect(AVATAR_PLACEHOLDER_URL);
  } catch (_error) {
    return res.redirect(AVATAR_PLACEHOLDER_URL);
  }
};

module.exports = {
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
};
