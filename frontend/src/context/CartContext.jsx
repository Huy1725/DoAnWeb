import { createContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext();

const CART_STORAGE_KEY = 'cartItems';

const parseStoredJson = (storedValue, fallbackValue) => {
  if (!storedValue) {
    return fallbackValue;
  }

  try {
    return JSON.parse(storedValue);
  } catch (_error) {
    return fallbackValue;
  }
};

const getNormalizedStock = (item) => {
  const parsedStock = Number(item?.stock);

  if (!Number.isFinite(parsedStock)) {
    return null;
  }

  return Math.max(0, Math.floor(parsedStock));
};

const clampQuantityByStock = (item, quantity) => {
  const stock = getNormalizedStock(item);

  if (stock === null) {
    return quantity;
  }

  return Math.min(quantity, stock);
};

const CartProvider = ({ children }) => {
  // Khởi tạo giỏ hàng từ localStorage để giữ dữ liệu sau khi reload.
  const [cartItems, setCartItems] = useState(() => {
    const storedItems = localStorage.getItem(CART_STORAGE_KEY);
    return parseStoredJson(storedItems, []);
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
      const currentStock = getNormalizedStock(product);

      if (currentStock !== null && currentStock <= 0) {
        return prevItems;
      }

      if (existingItem) {
        const mergedItem = {
          ...existingItem,
          ...product,
        };
        const nextQuantity = clampQuantityByStock(
          mergedItem,
          (Number(existingItem.quantity) || 1) + 1
        );

        return prevItems.map((item) =>
          (item._id || item.id) === productId
            ? {
                ...item,
                ...product,
                quantity: nextQuantity,
              }
            : item
        );
      }

      const itemToAdd = {
        ...product,
        quantity: 1,
      };
      const normalizedQuantity = clampQuantityByStock(itemToAdd, 1);

      if (normalizedQuantity <= 0) {
        return prevItems;
      }

      return [...prevItems, { ...itemToAdd, quantity: normalizedQuantity }];
    });
  };

  // Xóa sản phẩm khỏi giỏ theo id.
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => (item._id || item.id) !== productId));
  };

  // Cập nhật số lượng sản phẩm, qty <= 0 sẽ tự xóa khỏi giỏ.
  const updateQuantity = (productId, qty) => {
    const normalizedQty = Number(qty);

    if (!Number.isFinite(normalizedQty)) {
      return;
    }

    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if ((item._id || item.id) !== productId) {
            return item;
          }

          const limitedQuantity = clampQuantityByStock(item, normalizedQty);

          if (limitedQuantity <= 0) {
            return null;
          }

          return {
            ...item,
            quantity: limitedQuantity,
          };
        })
        .filter(Boolean)
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
