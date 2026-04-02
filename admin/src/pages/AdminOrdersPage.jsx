import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

// Format số tiền theo chuẩn hiển thị VND.
const formatCurrency = (amount) => `${Number(amount || 0).toLocaleString('vi-VN')}đ`;

// Format ngày đặt hàng cho giao diện quản trị.
const formatDate = (value) => {
  if (!value) return '--';
  return new Date(value).toLocaleDateString('vi-VN');
};

// Trả class màu trạng thái để phân biệt nhanh theo từng trạng thái đơn.
const getStatusSelectClass = (status) => {
  const normalizedStatus = (status || '').toLowerCase();

  if (normalizedStatus === 'completed') {
    return 'text-green-700';
  }

  if (normalizedStatus === 'processing') {
    return 'text-blue-700';
  }

  if (normalizedStatus === 'shipped') {
    return 'text-indigo-700';
  }

  if (normalizedStatus === 'cancelled') {
    return 'text-red-700';
  }

  return 'text-yellow-800';
};

// Trang quản trị đơn hàng: xem/sửa/xóa và đổi trạng thái đơn.
const AdminOrdersPage = () => {
  const { userInfo } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    paymentMethod: '',
    totalPrice: 0,
    status: 'Pending',
  });

  // Tải danh sách đơn hàng toàn hệ thống.
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders', {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Không thể tải danh sách đơn hàng');
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userInfo?.token) {
      setLoading(false);
      setError('Bạn chưa đăng nhập hoặc không có quyền truy cập.');
      return;
    }

    fetchOrders();
  }, [userInfo]);

  // Cập nhật trạng thái đơn hàng ngay trên bảng danh sách.
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Không thể cập nhật trạng thái đơn hàng');
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                status: newStatus,
              }
            : order
        )
      );
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi cập nhật trạng thái');
    }
  };

  // Mở modal chi tiết đơn hàng theo id.
  const handleViewDetail = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Không thể tải chi tiết đơn hàng');
      }

      const data = await response.json();
      setSelectedOrder(data);
      setIsDetailOpen(true);
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi tải chi tiết đơn hàng');
    }
  };

  // Mở modal sửa đơn và đổ dữ liệu hiện tại vào form.
  const handleOpenEdit = (order) => {
    setSelectedOrder(order);
    setEditForm({
      fullName: order.customerInfo?.fullName || '',
      phone: order.customerInfo?.phone || '',
      email: order.customerInfo?.email || '',
      address: order.customerInfo?.address || '',
      paymentMethod: order.paymentMethod || '',
      totalPrice: order.totalPrice || 0,
      status: order.status || 'Pending',
    });
    setIsEditOpen(true);
  };

  // Submit cập nhật thông tin đơn hàng.
  const handleEditSubmit = async (event) => {
    event.preventDefault();

    if (!selectedOrder?._id) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${selectedOrder._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({
          customerInfo: {
            fullName: editForm.fullName,
            phone: editForm.phone,
            email: editForm.email,
            address: editForm.address,
          },
          paymentMethod: editForm.paymentMethod,
          totalPrice: Number(editForm.totalPrice),
          status: editForm.status,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Không thể sửa đơn hàng');
      }

      setIsEditOpen(false);
      setSelectedOrder(null);
      await fetchOrders();
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi sửa đơn hàng');
    }
  };

  // Xóa đơn hàng theo id sau khi xác nhận.
  const handleDeleteOrder = async (orderId) => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa đơn hàng này?');
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Không thể xóa đơn hàng');
      }

      await fetchOrders();
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi xóa đơn hàng');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>

      {isDetailOpen && selectedOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Chi tiết đơn hàng</h2>
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-600"
              >
                Đóng
              </button>
            </div>

            <div className="space-y-3 text-sm text-gray-700">
              <p><span className="font-semibold">Mã đơn:</span> #{String(selectedOrder._id || '').slice(-6)}</p>
              <p><span className="font-semibold">Khách hàng:</span> {selectedOrder.customerInfo?.fullName}</p>
              <p><span className="font-semibold">SĐT:</span> {selectedOrder.customerInfo?.phone}</p>
              <p><span className="font-semibold">Email:</span> {selectedOrder.customerInfo?.email}</p>
              <p><span className="font-semibold">Địa chỉ:</span> {selectedOrder.customerInfo?.address}</p>
              <p><span className="font-semibold">Thanh toán:</span> {selectedOrder.paymentMethod}</p>
              <p><span className="font-semibold">Tổng tiền:</span> {formatCurrency(selectedOrder.totalPrice)}</p>

              <div>
                <p className="mb-2 font-semibold">Sản phẩm trong đơn</p>
                <ul className="space-y-1 rounded-lg border border-gray-200 p-3">
                  {selectedOrder.orderItems?.map((item, index) => (
                    <li key={`${item.name}-${index}`}>
                      {item.name} - SL: {item.quantity} - Giá: {item.price}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isEditOpen && selectedOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Sửa đơn hàng</h2>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-600"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input value={editForm.fullName} onChange={(e) => setEditForm((prev) => ({ ...prev, fullName: e.target.value }))} placeholder="Họ tên" className="rounded-lg border border-gray-300 px-3 py-2" required />
                <input value={editForm.phone} onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Số điện thoại" className="rounded-lg border border-gray-300 px-3 py-2" required />
                <input type="email" value={editForm.email} onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="Email" className="rounded-lg border border-gray-300 px-3 py-2" required />
                <input value={editForm.paymentMethod} onChange={(e) => setEditForm((prev) => ({ ...prev, paymentMethod: e.target.value }))} placeholder="Phương thức thanh toán" className="rounded-lg border border-gray-300 px-3 py-2" required />
                <input value={editForm.address} onChange={(e) => setEditForm((prev) => ({ ...prev, address: e.target.value }))} placeholder="Địa chỉ" className="rounded-lg border border-gray-300 px-3 py-2 md:col-span-2" required />
                <input type="number" min="0" value={editForm.totalPrice} onChange={(e) => setEditForm((prev) => ({ ...prev, totalPrice: e.target.value }))} placeholder="Tổng tiền" className="rounded-lg border border-gray-300 px-3 py-2" required />
                <select value={editForm.status} onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))} className="rounded-lg border border-gray-300 px-3 py-2" required>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <button type="submit" className="w-full rounded-lg bg-[#d70018] px-4 py-2 font-semibold text-white">
                Lưu thay đổi
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-600">
          Đang tải danh sách đơn hàng...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full border-collapse text-left">
            <thead className="bg-gray-50 text-sm text-gray-700">
              <tr>
                <th className="border-b border-gray-200 px-4 py-3 font-semibold">Mã đơn hàng</th>
                <th className="border-b border-gray-200 px-4 py-3 font-semibold">Ngày đặt</th>
                <th className="border-b border-gray-200 px-4 py-3 font-semibold">Khách hàng</th>
                <th className="border-b border-gray-200 px-4 py-3 font-semibold">Tổng tiền</th>
                <th className="border-b border-gray-200 px-4 py-3 font-semibold">Trạng thái</th>
                <th className="border-b border-gray-200 px-4 py-3 font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    Chưa có đơn hàng nào.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="odd:bg-white even:bg-gray-50/40">
                    <td className="border-b border-gray-100 px-4 py-3 font-medium text-gray-800">
                      #{String(order._id || '').slice(-6)}
                    </td>
                    <td className="border-b border-gray-100 px-4 py-3">{formatDate(order.createdAt)}</td>
                    <td className="border-b border-gray-100 px-4 py-3">
                      <p className="font-medium text-gray-800">{order.customerInfo?.fullName || '--'}</p>
                      <p className="text-xs text-gray-500">{order.customerInfo?.phone || '--'}</p>
                    </td>
                    <td className="border-b border-gray-100 px-4 py-3 font-semibold text-[#d70018]">
                      {formatCurrency(order.totalPrice)}
                    </td>
                    <td className="border-b border-gray-100 px-4 py-3">
                      <select
                        value={order.status || 'Pending'}
                        onChange={(event) => handleStatusChange(order._id, event.target.value)}
                        className={`rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold outline-none focus:border-[#d70018] ${getStatusSelectClass(
                          order.status
                        )}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="border-b border-gray-100 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => handleViewDetail(order._id)} className="rounded-md border border-indigo-200 px-3 py-1.5 text-xs text-indigo-600">
                          Chi tiết
                        </button>
                        <button type="button" onClick={() => handleOpenEdit(order)} className="rounded-md border border-blue-200 px-3 py-1.5 text-xs text-blue-600">
                          Sửa
                        </button>
                        <button type="button" onClick={() => handleDeleteOrder(order._id)} className="rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600">
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
