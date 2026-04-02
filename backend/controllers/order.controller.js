const Order = require('../models/order.model');

// Tạo đơn hàng mới cho user đang đăng nhập.
const createOrder = async (req, res) => {
  try {
    const order = new Order({
      ...req.body,
      user: req.user._id,
    });
    const createdOrder = await order.save();

    return res.status(201).json(createdOrder);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to create order',
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
  updateOrderStatus,
  updateOrder,
  deleteOrder,
};
