import { useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

// Chuyển chuỗi giá có ký tự tiền tệ về số để tính toán.
const parsePrice = (price) => Number((price || '').replace(/[^0-9]/g, ''));
// Format số tiền theo chuẩn hiển thị VND.
const formatCurrency = (amount) => `${amount.toLocaleString('vi-VN')}đ`;

// Trang checkout: nhập thông tin nhận hàng và tạo đơn hàng.
const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useContext(CartContext);
  const { userInfo } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    paymentMethod: 'cod',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tính tạm tính từ toàn bộ item trong giỏ.
  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + parsePrice(item.price) * (item.quantity || 1), 0),
    [cartItems]
  );

  // Cập nhật form thông tin khách hàng.
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validate và gửi đơn hàng lên backend.
  const handleSubmitOrder = async (event) => {
    event.preventDefault();

    if (cartItems.length === 0) {
      alert('Giỏ hàng đang trống, vui lòng thêm sản phẩm trước khi đặt hàng.');
      return;
    }

    const orderData = {
      customerInfo: {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
      },
      orderItems: cartItems.map((item) => ({
        product: item._id || item.id,
        name: item.name,
        quantity: item.quantity || 1,
        price: item.price,
      })),
      paymentMethod: formData.paymentMethod === 'cod' ? 'COD' : 'VNPay',
      totalPrice: subtotal,
    };

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Không thể lưu đơn hàng, vui lòng thử lại.');
      }

      alert('Chúc mừng! Bạn đã đặt hàng thành công.');
      clearCart();
      navigate('/');
    } catch (error) {
      alert(error.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="col-span-1 lg:col-span-7">
          <h1 className="text-xl font-bold text-gray-900">Thông tin đặt hàng</h1>

          <form onSubmit={handleSubmitOrder} className="mt-4 space-y-4">
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Họ và tên"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100"
            />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Số điện thoại"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100"
            />
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Địa chỉ nhận hàng"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100"
            />

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="text-sm font-semibold text-gray-800">Phương thức thanh toán</h2>
              <div className="mt-3 space-y-2 text-sm text-gray-700">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleInputChange}
                  />
                  <span>Thanh toán khi nhận hàng (COD)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={formData.paymentMethod === 'online'}
                    onChange={handleInputChange}
                  />
                  <span>Thanh toán qua VNPay/Momo</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || cartItems.length === 0}
              className="w-full rounded-lg bg-red-600 px-4 py-3 text-base font-bold text-white uppercase"
            >
              {isSubmitting ? 'Đang xử lý...' : 'ĐẶT HÀNG'}
            </button>
          </form>
        </section>

        <aside className="col-span-1 lg:col-span-5">
          <div className="rounded-xl bg-gray-50 p-6">
            <h2 className="text-lg font-bold text-gray-900">Tóm tắt đơn hàng</h2>

            <div className="mt-4 space-y-3">
              {cartItems.length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có sản phẩm trong giỏ hàng.</p>
              ) : (
                cartItems.map((item) => {
                  const productId = item._id || item.id;
                  return (
                    <div key={productId} className="flex items-center gap-3 rounded-lg bg-white p-2">
                      <img src={item.image} alt={item.name} className="h-12 w-12 object-contain" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-500">SL: {item.quantity || 1}</p>
                      </div>
                      <p className="text-sm font-semibold text-[#d70018]">{item.price}</p>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-6 space-y-2 border-t border-gray-200 pt-4 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <span>Tạm tính</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Phí vận chuyển</span>
                <span>Miễn phí</span>
              </div>
              <div className="flex items-center justify-between text-base font-bold">
                <span>Tổng cộng</span>
                <span className="text-xl text-[#d70018]">{formatCurrency(subtotal)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;
