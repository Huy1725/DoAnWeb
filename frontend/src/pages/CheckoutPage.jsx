import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config/url';

// Chuyển chuỗi giá có ký tự tiền tệ về số để tính toán.
const parsePrice = (price) => Number((price || '').replace(/[^0-9]/g, ''));
// Format số tiền theo chuẩn hiển thị VND.
const formatCurrency = (amount) => `${amount.toLocaleString('vi-VN')}đ`;

const getItemStock = (item) => {
  const parsedStock = Number(item?.stock);

  if (!Number.isFinite(parsedStock)) {
    return null;
  }

  return Math.max(0, Math.floor(parsedStock));
};

const getProductImageSrc = (item) => {
  const productId = item._id || item.id || item.product;

  if (productId) {
    return `${API_BASE_URL}/api/products/${productId}/image`;
  }

  return item.image || 'https://placehold.co/300x300?text=Product';
};

const calculateVoucherDiscount = (subtotalAmount, voucher) => {
  if (!voucher) {
    return 0;
  }

  if (voucher.discountType === 'fixed') {
    return Math.min(subtotalAmount, Number(voucher.discountValue || 0));
  }

  if (voucher.discountType === 'percent') {
    const rawDiscount = (subtotalAmount * Number(voucher.discountValue || 0)) / 100;
    const maxDiscountAmount = Number(voucher.maxDiscountAmount || 0);

    if (maxDiscountAmount > 0) {
      return Math.min(subtotalAmount, rawDiscount, maxDiscountAmount);
    }

    return Math.min(subtotalAmount, rawDiscount);
  }

  return 0;
};

const getVoucherLabel = (voucher) => {
  if (!voucher) {
    return '';
  }

  if (voucher.discountType === 'fixed') {
    return `${voucher.code} - Giam ${formatCurrency(voucher.discountValue || 0)}`;
  }

  return `${voucher.code} - Giam ${voucher.discountValue || 0}% (max ${formatCurrency(
    voucher.maxDiscountAmount || 0
  )})`;
};

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
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [selectedVoucherCode, setSelectedVoucherCode] = useState('');
  const [manualVoucherCode, setManualVoucherCode] = useState('');
  const [loadingVouchers, setLoadingVouchers] = useState(false);

  // Tính tạm tính từ toàn bộ item trong giỏ.
  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + parsePrice(item.price) * (item.quantity || 1), 0),
    [cartItems]
  );

  const hasInvalidStockItem = useMemo(
    () =>
      cartItems.some((item) => {
        const stock = getItemStock(item);

        if (stock === null) {
          return false;
        }

        return stock <= 0 || (item.quantity || 1) > stock;
      }),
    [cartItems]
  );

  useEffect(() => {
    const fetchAvailableVouchers = async () => {
      if (!userInfo?.token) {
        setAvailableVouchers([]);
        return;
      }

      try {
        setLoadingVouchers(true);
        const response = await fetch('/api/users/me/vouchers?status=available', {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setAvailableVouchers(Array.isArray(data) ? data : []);
      } catch (_error) {
        setAvailableVouchers([]);
      } finally {
        setLoadingVouchers(false);
      }
    };

    fetchAvailableVouchers();
  }, [userInfo?.token]);

  const selectedVoucher = useMemo(
    () =>
      availableVouchers.find(
        (voucher) =>
          String(voucher.code || '').toUpperCase() === String(selectedVoucherCode || '').toUpperCase()
      ) || null,
    [availableVouchers, selectedVoucherCode]
  );

  const appliedVoucherCode = useMemo(() => {
    if (selectedVoucher?.code) {
      return selectedVoucher.code;
    }

    return String(manualVoucherCode || '').trim().toUpperCase();
  }, [selectedVoucher, manualVoucherCode]);

  const voucherInvalidReason = useMemo(() => {
    if (!selectedVoucher) {
      return '';
    }

    if (subtotal < Number(selectedVoucher.minOrderValue || 0)) {
      return `Don toi thieu de dung voucher nay la ${formatCurrency(
        selectedVoucher.minOrderValue || 0
      )}.`;
    }

    return '';
  }, [selectedVoucher, subtotal]);

  const discountAmount = useMemo(() => {
    if (voucherInvalidReason) {
      return 0;
    }

    return Math.floor(calculateVoucherDiscount(subtotal, selectedVoucher));
  }, [subtotal, selectedVoucher, voucherInvalidReason]);

  const payableTotal = Math.max(0, subtotal - discountAmount);

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

    if (hasInvalidStockItem) {
      alert('Giỏ hàng đang có sản phẩm vượt quá tồn kho hoặc đã hết hàng. Vui lòng kiểm tra lại.');
      return;
    }

    if (voucherInvalidReason) {
      alert(voucherInvalidReason);
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
      totalPrice: payableTotal,
      voucherCode: appliedVoucherCode || null,
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
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Không thể lưu đơn hàng, vui lòng thử lại.');
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

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="text-sm font-semibold text-gray-800">Voucher khuyen mai</h2>
              <div className="mt-3 space-y-2">
                <select
                  value={selectedVoucherCode}
                  onChange={(event) => {
                    const nextCode = event.target.value;
                    setSelectedVoucherCode(nextCode);

                    if (nextCode) {
                      setManualVoucherCode('');
                    }
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Khong su dung voucher</option>
                  {availableVouchers.map((voucher) => (
                    <option key={voucher._id} value={voucher.code}>
                      {getVoucherLabel(voucher)}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={manualVoucherCode}
                  onChange={(event) => setManualVoucherCode(event.target.value.toUpperCase())}
                  placeholder="Hoac nhap ma voucher tu chuong trinh khuyen mai"
                  disabled={Boolean(selectedVoucherCode)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase disabled:cursor-not-allowed disabled:bg-gray-100"
                />

                {loadingVouchers ? (
                  <p className="text-xs text-gray-500">Dang tai danh sach voucher...</p>
                ) : null}

                {selectedVoucher ? (
                  <p className="text-xs text-gray-600">
                    Don toi thieu: {formatCurrency(selectedVoucher.minOrderValue || 0)}
                  </p>
                ) : null}

                {appliedVoucherCode && !selectedVoucher ? (
                  <p className="text-xs text-gray-500">
                    Ma {appliedVoucherCode} se duoc he thong kiem tra khi dat hang.
                  </p>
                ) : null}

                {voucherInvalidReason ? (
                  <p className="text-xs font-semibold text-red-600">{voucherInvalidReason}</p>
                ) : null}
              </div>
            </div>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                cartItems.length === 0 ||
                hasInvalidStockItem ||
                Boolean(voucherInvalidReason)
              }
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
              {hasInvalidStockItem ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                  Có sản phẩm trong giỏ vượt quá tồn kho hoặc đã hết hàng.
                </p>
              ) : null}
              {appliedVoucherCode ? (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  Voucher dang ap dung: <span className="font-semibold">{appliedVoucherCode}</span>
                  {selectedVoucher ? '' : ' (se xac thuc khi dat hang)'}
                </p>
              ) : null}
              {cartItems.length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có sản phẩm trong giỏ hàng.</p>
              ) : (
                cartItems.map((item) => {
                  const productId = item._id || item.id;
                  return (
                    <div key={productId} className="flex items-center gap-3 rounded-lg bg-white p-2">
                      <img
                        src={getProductImageSrc(item)}
                        alt={item.name}
                        className="h-12 w-12 object-contain"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src =
                            item.image || 'https://placehold.co/300x300?text=Product';
                        }}
                      />
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
              <div className="flex items-center justify-between">
                <span>Giam gia voucher</span>
                <span className={discountAmount > 0 ? 'font-semibold text-emerald-700' : ''}>
                  -{formatCurrency(discountAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-base font-bold">
                <span>Tổng cộng</span>
                <span className="text-xl text-[#d70018]">{formatCurrency(payableTotal)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;
