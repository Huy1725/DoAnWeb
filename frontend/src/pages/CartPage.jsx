import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { MainContent } from '../components/MainLayout';
import { CartContext } from '../context/CartContext';
import { API_BASE_URL } from '../config/url';

// Chuyển chuỗi giá về số để tính tổng tiền.
const parsePrice = (price) => Number((price || '').replace(/[^0-9]/g, ''));

const getItemStock = (item) => {
  const parsedStock = Number(item?.stock);

  if (!Number.isFinite(parsedStock)) {
    return null;
  }

  return Math.max(0, Math.floor(parsedStock));
};

// Format tiền tệ theo chuẩn hiển thị VND.
const formatCurrency = (amount) => `${amount.toLocaleString('vi-VN')}đ`;

const getProductImageSrc = (item) => {
  const productId = item._id || item.id || item.product;

  if (productId) {
    return `${API_BASE_URL}/api/products/${productId}/image`;
  }

  return item.image || 'https://placehold.co/300x300?text=Product';
};

// Trang giỏ hàng: cập nhật số lượng, xóa item và đi tới checkout.
const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity } = useContext(CartContext);

  // Tính tạm tính của toàn bộ giỏ hàng.
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + parsePrice(item.price) * (item.quantity || 1);
  }, 0);

  const hasInvalidStockItem = cartItems.some((item) => {
    const stock = getItemStock(item);

    if (stock === null) {
      return false;
    }

    return stock <= 0 || (item.quantity || 1) > stock;
  });

  return (
    <MainContent>
      <section className="mt-4 rounded-xl bg-white p-4 shadow-sm">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">Giỏ hàng</h1>

        {cartItems.length === 0 ? (
          <div className="rounded-md border border-gray-200 bg-gray-50 p-6 text-center text-gray-600">
            Giỏ hàng của bạn đang trống.
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {cartItems.map((item) => {
                const productId = item._id || item.id;
                return (
                  <div
                    key={productId}
                    className="grid grid-cols-1 items-center gap-3 rounded-lg border border-gray-100 p-3 md:grid-cols-[96px_1fr_auto_auto]"
                  >
                    <img
                      src={getProductImageSrc(item)}
                      alt={item.name}
                      className="h-24 w-24 object-contain"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src =
                          item.image || 'https://placehold.co/300x300?text=Product';
                      }}
                    />

                    <div>
                      <h2 className="font-semibold text-gray-900">{item.name}</h2>
                      <p className="text-sm text-[#d70018]">{item.price}</p>
                      {(() => {
                        const stock = getItemStock(item);

                        if (stock === null) {
                          return null;
                        }

                        if (stock <= 0) {
                          return <p className="text-xs font-semibold text-red-600">Hết hàng</p>;
                        }

                        return (
                          <p className="text-xs text-gray-500">
                            Tồn kho: <span className="font-semibold text-gray-700">{stock}</span>
                          </p>
                        );
                      })()}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(productId, (item.quantity || 1) - 1)}
                        className="h-8 w-8 rounded border border-gray-200 text-gray-700"
                      >
                        -
                      </button>
                      <span className="min-w-6 text-center font-medium">{item.quantity || 1}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(productId, (item.quantity || 1) + 1)}
                        disabled={
                          getItemStock(item) !== null &&
                          (item.quantity || 1) >= Number(getItemStock(item))
                        }
                        className="h-8 w-8 rounded border border-gray-200 text-gray-700 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(productId)}
                      className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-600"
                    >
                      Xóa
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-end border-t border-gray-100 pt-4">
              <div className="w-full max-w-sm space-y-3">
                {hasInvalidStockItem ? (
                  <p className="text-right text-sm font-medium text-red-600">
                    Giỏ hàng có sản phẩm vượt quá tồn kho hoặc đã hết hàng.
                  </p>
                ) : null}
                <p className="text-right text-lg font-bold text-gray-900">
                  Tạm tính: <span className="text-[#d70018]">{formatCurrency(subtotal)}</span>
                </p>
                <Link
                  to="/checkout"
                  aria-disabled={cartItems.length === 0 || hasInvalidStockItem}
                  onClick={(event) => {
                    if (cartItems.length === 0 || hasInvalidStockItem) {
                      event.preventDefault();
                    }
                  }}
                  className={`block w-full rounded-lg p-3 text-center font-bold text-white ${
                    cartItems.length === 0 || hasInvalidStockItem
                      ? 'cursor-not-allowed bg-gray-400'
                      : 'bg-[#d70018] hover:opacity-90'
                  }`}
                >
                  Tiến hành thanh toán
                </Link>
              </div>
            </div>
          </>
        )}
      </section>
    </MainContent>
  );
};

export default CartPage;
