import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

// Format số tiền theo chuẩn hiển thị VND.
const formatCurrency = (amount) => `${Number(amount || 0).toLocaleString('vi-VN')}đ`;

// Format ngày tạo đơn hàng.
const formatDate = (value) => {
  if (!value) return '--';
  return new Date(value).toLocaleDateString('vi-VN');
};

// Trang lịch sử đơn hàng của người dùng đang đăng nhập.
const MyOrdersPage = () => {
  const { userInfo } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Tải danh sách đơn của user hiện tại.
    const fetchMyOrders = async () => {
      try {
        const response = await fetch('/api/orders/myorders', {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Không thể tải lịch sử đơn hàng');
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message || 'Đã xảy ra lỗi khi tải đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    if (userInfo?.token) {
      fetchMyOrders();
    } else {
      setLoading(false);
      setError('Bạn cần đăng nhập để xem đơn hàng.');
    }
  }, [userInfo]);

  // Lấy chi tiết 1 đơn hàng của user và mở modal xem chi tiết.
  const handleViewOrderDetail = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/myorders/${orderId}`, {
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

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Đơn hàng của tôi</h1>

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
              <p><span className="font-semibold">Ngày đặt:</span> {formatDate(selectedOrder.createdAt)}</p>
              <p><span className="font-semibold">Trạng thái:</span> {selectedOrder.status || 'Pending'}</p>
              <p><span className="font-semibold">Tổng tiền:</span> {formatCurrency(selectedOrder.totalPrice)}</p>
              <p><span className="font-semibold">Địa chỉ giao:</span> {selectedOrder.customerInfo?.address || '--'}</p>

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

      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-600">Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full border-collapse text-left">
            <thead className="bg-gray-50 text-sm text-gray-700">
              <tr>
                <th className="border-b border-gray-200 px-4 py-3 font-semibold">Mã đơn</th>
                <th className="border-b border-gray-200 px-4 py-3 font-semibold">Ngày đặt</th>
                <th className="border-b border-gray-200 px-4 py-3 font-semibold">Tổng tiền</th>
                <th className="border-b border-gray-200 px-4 py-3 font-semibold">Trạng thái</th>
                <th className="border-b border-gray-200 px-4 py-3 font-semibold">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    Bạn chưa có đơn hàng nào.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="odd:bg-white even:bg-gray-50/40">
                    <td className="border-b border-gray-100 px-4 py-3 font-medium">#{String(order._id || '').slice(-6)}</td>
                    <td className="border-b border-gray-100 px-4 py-3">{formatDate(order.createdAt)}</td>
                    <td className="border-b border-gray-100 px-4 py-3 text-[#d70018] font-semibold">{formatCurrency(order.totalPrice)}</td>
                    <td className="border-b border-gray-100 px-4 py-3">{order.status || 'Pending'}</td>
                    <td className="border-b border-gray-100 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleViewOrderDetail(order._id)}
                        className="rounded-md border border-blue-200 px-3 py-1.5 text-xs text-blue-600"
                      >
                        Xem chi tiết
                      </button>
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

export default MyOrdersPage;
