const mongoose = require('mongoose');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const Promotion = require('../models/promotion.model');
const UserVoucher = require('../models/userVoucher.model');
const Notification = require('../models/notification.model');
const {
  getTierTransitions,
  resolveMembershipTierBySpent,
} = require('../services/membership.service');

const normalizeVoucherCode = (value = '') => String(value || '').trim().toUpperCase();

const parseCurrencyValue = (value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  const normalizedValue = String(value || '').replace(/[^0-9]/g, '');
  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const calculateOrderSubtotal = (orderItems = []) =>
  orderItems.reduce((sum, item) => {
    const quantity = Math.max(0, Math.floor(Number(item.quantity || 0)));
    const unitPrice = parseCurrencyValue(item.price);
    return sum + quantity * unitPrice;
  }, 0);

const calculateVoucherDiscount = (subtotalPrice, voucher) => {
  if (!voucher || subtotalPrice <= 0) {
    return 0;
  }

  if (voucher.discountType === 'fixed') {
    return Math.min(subtotalPrice, Number(voucher.discountValue || 0));
  }

  if (voucher.discountType === 'percent') {
    const rawDiscount = (subtotalPrice * Number(voucher.discountValue || 0)) / 100;
    const maxDiscountAmount = Number(voucher.maxDiscountAmount || 0);

    if (maxDiscountAmount > 0) {
      return Math.min(subtotalPrice, rawDiscount, maxDiscountAmount);
    }

    return Math.min(subtotalPrice, rawDiscount);
  }

  return 0;
};

const createUserNotification = async ({ userId, type, title, message, metadata = null }) => {
  try {
    await Notification.create({
      user: userId,
      type,
      title,
      message,
      metadata,
    });
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};

const ensureTierRewardPromotion = async (transition) => {
  if (!transition?.reward) {
    return null;
  }

  const existingPromotion = await Promotion.findOne({ code: transition.reward.voucherCode });

  if (existingPromotion) {
    return existingPromotion;
  }

  return Promotion.create({
    name: transition.reward.voucherName,
    code: transition.reward.voucherCode,
    discountType: transition.reward.discountType,
    discountValue: transition.reward.discountValue,
    maxDiscountAmount: transition.reward.maxDiscountAmount,
    minOrderValue: transition.reward.minOrderValue,
    active: true,
    autoTierReward: true,
    tierFrom: transition.fromTierCode,
    tierTo: transition.toTierCode,
  });
};

const issueTierRewardsIfNeeded = async ({ userId, previousTierCode, nextTierCode }) => {
  const transitions = getTierTransitions(previousTierCode, nextTierCode);

  if (!transitions.length) {
    return;
  }

  for (const transition of transitions) {
    await createUserNotification({
      userId,
      type: 'tier-upgrade',
      title: 'Ban da len hang thanh vien',
      message: `Ban vua len hang tu ${transition.fromTierCode} len ${transition.toTierCode}.`,
      metadata: {
        fromTier: transition.fromTierCode,
        toTier: transition.toTierCode,
      },
    });

    if (!transition.reward) {
      continue;
    }

    const rewardPromotion = await ensureTierRewardPromotion(transition);

    if (!rewardPromotion) {
      continue;
    }

    const userVoucher = await UserVoucher.create({
      user: userId,
      promotion: rewardPromotion._id,
      code: rewardPromotion.code,
      discountType: rewardPromotion.discountType,
      discountValue: rewardPromotion.discountValue,
      maxDiscountAmount: rewardPromotion.maxDiscountAmount,
      minOrderValue: rewardPromotion.minOrderValue,
      status: 'available',
      source: 'tier-upgrade',
      issuedReason: `Thuong len hang ${transition.fromTierCode} -> ${transition.toTierCode}`,
    });

    await createUserNotification({
      userId,
      type: 'voucher-reward',
      title: 'Ban vua nhan voucher moi',
      message: `He thong da tang voucher ${userVoucher.code} khi ban len ${transition.toTierCode}.`,
      metadata: {
        voucherCode: userVoucher.code,
        discountType: userVoucher.discountType,
        discountValue: userVoucher.discountValue,
        maxDiscountAmount: userVoucher.maxDiscountAmount,
        fromTier: transition.fromTierCode,
        toTier: transition.toTierCode,
      },
    });
  }
};

const syncMembershipTierAfterOrder = async (userId) => {
  const [user, totalSpentResult] = await Promise.all([
    User.findById(userId),
    Order.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          status: { $ne: 'Cancelled' },
        },
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$totalPrice' },
        },
      },
    ]),
  ]);

  if (!user) {
    return;
  }

  const totalSpent = Number(totalSpentResult[0]?.totalSpent || 0);
  const previousTierCode = user.membershipTier || 'S-NULL';
  const nextTierCode = resolveMembershipTierBySpent(totalSpent).code;

  if (previousTierCode === nextTierCode) {
    return;
  }

  user.membershipTier = nextTierCode;
  await user.save();

  await issueTierRewardsIfNeeded({
    userId: user._id,
    previousTierCode,
    nextTierCode,
  });
};

const rollbackProductStocks = async (reservedItems) => {
  if (!Array.isArray(reservedItems) || reservedItems.length === 0) {
    return;
  }

  await Promise.all(
    reservedItems.map((item) =>
      Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      })
    )
  );
};

const collectRequestedQuantities = (orderItems = []) => {
  const requestedMap = new Map();

  for (const item of orderItems) {
    const productId = item.product;
    const quantity = Math.floor(Number(item.quantity || 0));

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return { error: 'Sản phẩm trong đơn hàng không hợp lệ' };
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return { error: 'Số lượng sản phẩm phải lớn hơn 0' };
    }

    const key = String(productId);
    const currentEntry = requestedMap.get(key);

    requestedMap.set(key, {
      productId: key,
      quantity: (currentEntry?.quantity || 0) + quantity,
      name: item.name || currentEntry?.name || 'Sản phẩm',
    });
  }

  return { requestedMap };
};

const buildMonthKey = (dateValue) => {
  const date = new Date(dateValue);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}-${month}`;
};

const formatMonthLabel = (monthKey) => {
  const [year, month] = String(monthKey).split('-');
  return `${month}/${year}`;
};

// Tạo đơn hàng mới cho user đang đăng nhập.
const createOrder = async (req, res) => {
  try {
    if (!Array.isArray(req.body.orderItems) || req.body.orderItems.length === 0) {
      return res.status(400).json({ message: 'Đơn hàng phải có ít nhất 1 sản phẩm' });
    }

    const normalizedOrderItems = req.body.orderItems.map((item) => ({
      ...item,
      quantity: Math.floor(Number(item.quantity || 1)),
    }));

    const subtotalPrice = calculateOrderSubtotal(normalizedOrderItems);

    if (subtotalPrice <= 0) {
      return res.status(400).json({ message: 'Tổng tiền đơn hàng không hợp lệ' });
    }

    const { error, requestedMap } = collectRequestedQuantities(normalizedOrderItems);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const selectedVoucherCode = normalizeVoucherCode(req.body.voucherCode);
    let selectedUserVoucher = null;
    let discountAmount = 0;
    let appliedVoucher = null;
    let discountSource = null;

    if (selectedVoucherCode) {
      selectedUserVoucher = await UserVoucher.findOne({
        user: req.user._id,
        code: selectedVoucherCode,
        status: 'available',
      });

      const discountCandidate = selectedUserVoucher
        ? selectedUserVoucher
        : await Promotion.findOne({
            code: selectedVoucherCode,
            active: true,
            autoTierReward: false,
          });

      if (!discountCandidate) {
        return res.status(400).json({ message: 'Voucher khong hop le hoac da het hieu luc' });
      }

      if (!selectedUserVoucher) {
        discountSource = 'promotion';
      } else {
        discountSource = 'user-voucher';
      }

      if (subtotalPrice < Number(discountCandidate.minOrderValue || 0)) {
        return res.status(400).json({
          message: `Don toi thieu de dung voucher la ${Number(
            discountCandidate.minOrderValue || 0
          ).toLocaleString('vi-VN')}d`,
        });
      }

      discountAmount = Math.floor(calculateVoucherDiscount(subtotalPrice, discountCandidate));

      if (discountAmount <= 0) {
        return res.status(400).json({ message: 'Voucher khong the ap dung cho don hang nay' });
      }

      appliedVoucher = {
        code: discountCandidate.code,
        discountType: discountCandidate.discountType,
        discountValue: discountCandidate.discountValue,
        maxDiscountAmount: discountCandidate.maxDiscountAmount,
      };
    }

    const finalTotalPrice = Math.max(0, subtotalPrice - discountAmount);

    const reservedItems = [];

    for (const requestedItem of requestedMap.values()) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: requestedItem.productId,
          stock: { $gte: requestedItem.quantity },
        },
        {
          $inc: { stock: -requestedItem.quantity },
        },
        {
          new: true,
          select: 'name stock',
        }
      );

      if (!updatedProduct) {
        await rollbackProductStocks(reservedItems);

        const product = await Product.findById(requestedItem.productId).select('name stock');

        if (!product) {
          return res.status(404).json({
            message: `Không tìm thấy sản phẩm trong kho cho mục "${requestedItem.name}"`,
          });
        }

        return res.status(400).json({
          message: `Sản phẩm "${product.name}" chỉ còn ${product.stock || 0} trong kho`,
        });
      }

      reservedItems.push({
        productId: requestedItem.productId,
        quantity: requestedItem.quantity,
      });
    }

    const order = new Order({
      customerInfo: req.body.customerInfo,
      orderItems: normalizedOrderItems,
      paymentMethod: req.body.paymentMethod,
      subtotalPrice,
      discountAmount,
      appliedVoucher,
      totalPrice: finalTotalPrice,
      user: req.user._id,
    });

    let createdOrder;

    try {
      createdOrder = await order.save();
    } catch (saveError) {
      await rollbackProductStocks(reservedItems);
      throw saveError;
    }

    if (selectedUserVoucher) {
      try {
        selectedUserVoucher.status = 'used';
        selectedUserVoucher.usedAt = new Date();
        selectedUserVoucher.usedOrder = createdOrder._id;
        await selectedUserVoucher.save();
      } catch (voucherError) {
        console.error('Failed to mark voucher as used:', voucherError.message);
      }
    }

    await createUserNotification({
      userId: req.user._id,
      type: 'order-success',
      title: 'Dat hang thanh cong',
      message: `Don hang #${String(createdOrder._id).slice(-6)} da duoc tao thanh cong.`,
      metadata: {
        orderId: createdOrder._id,
        totalPrice: createdOrder.totalPrice,
        discountAmount: createdOrder.discountAmount || 0,
        voucherSource: discountSource,
      },
    });

    try {
      await syncMembershipTierAfterOrder(req.user._id);
    } catch (tierError) {
      console.error('Failed to sync membership tier:', tierError.message);
    }

    return res.status(201).json(createdOrder);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to create order',
      error: error.message,
    });
  }
};

// Lấy dữ liệu tổng hợp phục vụ dashboard báo cáo cho admin.
const getAdminReportSummary = async (_req, res) => {
  try {
    const [
      totalProducts,
      totalUsers,
      totalOrders,
      totalStockResult,
      allOrders,
      lowStockCount,
      outOfStockCount,
      lowStockProducts,
      outOfStockProducts,
    ] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
      Order.countDocuments(),
      Product.aggregate([
        {
          $group: {
            _id: null,
            totalStock: { $sum: '$stock' },
          },
        },
      ]),
      Order.find().select('status totalPrice createdAt orderItems').lean(),
      Product.countDocuments({ stock: { $gt: 0, $lte: 5 } }),
      Product.countDocuments({ stock: { $lte: 0 } }),
      Product.find({ stock: { $gt: 0, $lte: 5 } })
        .select('name stock price')
        .sort({ stock: 1, updatedAt: -1 })
        .limit(10)
        .lean(),
      Product.find({ stock: { $lte: 0 } })
        .select('name stock price')
        .sort({ updatedAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const ordersByStatus = {};
    const topSellingProductsMap = new Map();

    const currentDate = new Date();
    const monthKeys = [];

    for (let index = 5; index >= 0; index -= 1) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - index, 1);
      monthKeys.push(buildMonthKey(monthDate));
    }

    const monthlyRevenueMap = new Map(monthKeys.map((key) => [key, 0]));
    let totalRevenue = 0;
    let totalDiscount = 0;

    allOrders.forEach((order) => {
      const statusLabel = String(order.status || 'Pending');
      const normalizedStatus = statusLabel.toLowerCase();
      const orderTotal = Number(order.totalPrice || 0);

      ordersByStatus[statusLabel] = (ordersByStatus[statusLabel] || 0) + 1;

      if (Number.isFinite(orderTotal) && normalizedStatus !== 'cancelled') {
        totalRevenue += orderTotal;
        totalDiscount += Number(order.discountAmount || 0);

        if (order.createdAt) {
          const monthKey = buildMonthKey(order.createdAt);

          if (monthlyRevenueMap.has(monthKey)) {
            monthlyRevenueMap.set(monthKey, (monthlyRevenueMap.get(monthKey) || 0) + orderTotal);
          }
        }
      }

      if (!Array.isArray(order.orderItems)) {
        return;
      }

      order.orderItems.forEach((item) => {
        const soldQuantity = Math.max(0, Math.floor(Number(item.quantity || 0)));

        if (!soldQuantity) {
          return;
        }

        const productKey = String(item.product || item.name || 'unknown');
        const currentEntry = topSellingProductsMap.get(productKey);

        if (currentEntry) {
          currentEntry.totalSold += soldQuantity;
          return;
        }

        topSellingProductsMap.set(productKey, {
          productId: item.product || null,
          name: item.name || 'Sản phẩm',
          totalSold: soldQuantity,
        });
      });
    });

    const monthlyRevenue = monthKeys.map((monthKey) => ({
      month: formatMonthLabel(monthKey),
      revenue: monthlyRevenueMap.get(monthKey) || 0,
    }));

    const topSellingProducts = Array.from(topSellingProductsMap.values())
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10);

    return res.status(200).json({
      generatedAt: new Date().toISOString(),
      summary: {
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue,
        totalDiscount,
        totalStock: totalStockResult[0]?.totalStock || 0,
        lowStockCount,
        outOfStockCount,
      },
      ordersByStatus,
      monthlyRevenue,
      topSellingProducts,
      lowStockProducts,
      outOfStockProducts,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch report summary',
      error: error.message,
    });
  }
};

// Lấy danh sách đơn hàng của user hiện tại.
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch user orders',
      error: error.message,
    });
  }
};

// Lấy chi tiết đơn hàng của user hiện tại theo id.
const getMyOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user order detail', error: error.message });
  }
};

// Lấy toàn bộ đơn hàng (dành cho admin).
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch orders',
      error: error.message,
    });
  }
};

// Lấy chi tiết đơn hàng theo id (dành cho admin).
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch order detail', error: error.message });
  }
};

// Cập nhật nhanh trạng thái đơn hàng.
const updateOrderStatus = async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json(updatedOrder);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to update order status',
      error: error.message,
    });
  }
};

// Cập nhật đầy đủ thông tin đơn hàng.
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const { customerInfo, paymentMethod, totalPrice, status, orderItems } = req.body;

    if (customerInfo) {
      order.customerInfo = {
        ...order.customerInfo,
        ...customerInfo,
      };
    }

    order.paymentMethod = paymentMethod ?? order.paymentMethod;
    order.totalPrice = totalPrice !== undefined ? Number(totalPrice) : order.totalPrice;
    order.status = status ?? order.status;
    order.orderItems = Array.isArray(orderItems) && orderItems.length > 0 ? orderItems : order.orderItems;

    const updatedOrder = await order.save();
    return res.status(200).json(updatedOrder);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update order', error: error.message });
  }
};

// Xóa đơn hàng theo id.
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.deleteOne();
    return res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete order', error: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  getMyOrders,
  getMyOrderById,
  getAdminReportSummary,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
};
