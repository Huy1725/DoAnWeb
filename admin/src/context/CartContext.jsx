import { createContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext();

const CART_STORAGE_KEY = 'cartItems';

const CartProvider = ({ children }) => {
  // Khởi tạo giỏ hàng từ localStorage để giữ dữ liệu sau khi reload.
  const [cartItems, setCartItems] = useState(() => {
    const storedItems = localStorage.getItem(CART_STORAGE_KEY);
    return storedItems ? JSON.parse(storedItems) : [];
  });

  // Đồng bộ giỏ hàng hiện tại vào localStorage mỗi khi có thay đổi.
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // Thêm sản phẩm vào giỏ, nếu đã có thì tăng số lượng.
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const productId = product._id || product.id;
      const existingItem = prevItems.find((item) => (item._id || item.id) === productId);

      if (existingItem) {
        return prevItems.map((item) =>
          (item._id || item.id) === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  // Xóa sản phẩm khỏi giỏ theo id.
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => (item._id || item.id) !== productId));
  };

  // Cập nhật số lượng sản phẩm, qty <= 0 sẽ tự xóa khỏi giỏ.
  const updateQuantity = (productId, qty) => {
    const normalizedQty = Number(qty);

    if (normalizedQty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        (item._id || item.id) === productId ? { ...item, quantity: normalizedQty } : item
      )
    );
  };

  // Xóa toàn bộ giỏ hàng sau khi checkout hoặc theo yêu cầu user.
  const clearCart = () => {
    setCartItems([]);
  };

  // Memo hóa context value để giảm re-render component con.
  const contextValue = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }),
    [cartItems]
  );

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};

export { CartContext, CartProvider };
