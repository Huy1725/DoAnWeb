const express = require('express');

const {
	createOrder,
	getOrders,
	getOrderById,
	getMyOrders,
	getMyOrderById,
	updateOrderStatus,
	updateOrder,
	deleteOrder,
} = require('../controllers/order.controller');
const { protect, admin } = require('../middleware/auth.middleware');

const router = express.Router();

// Lấy toàn bộ đơn hàng (admin).
router.get('/', protect, admin, getOrders);
// Lấy danh sách đơn của user hiện tại.
router.get('/myorders', protect, getMyOrders);
// Lấy chi tiết đơn của user hiện tại.
router.get('/myorders/:id', protect, getMyOrderById);
// Lấy chi tiết đơn theo id (admin).
router.get('/:id', protect, admin, getOrderById);
// Cập nhật trạng thái đơn hàng (admin).
router.patch('/:id/status', protect, admin, updateOrderStatus);
// Cập nhật đầy đủ đơn hàng (admin).
router.put('/:id', protect, admin, updateOrder);
// Xóa đơn hàng (admin).
router.delete('/:id', protect, admin, deleteOrder);
// Tạo đơn hàng mới.
router.post('/', protect, createOrder);

module.exports = router;
