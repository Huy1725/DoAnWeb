import { createContext, useMemo, useState } from 'react';

const AuthContext = createContext();

const AUTH_STORAGE_KEY = 'userInfo';

const AuthProvider = ({ children }) => {
  // Khởi tạo trạng thái đăng nhập từ localStorage để giữ phiên.
  const [userInfo, setUserInfo] = useState(() => {
    const storedValue = localStorage.getItem(AUTH_STORAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : null;
  });

  // Gọi API đăng nhập, lưu user + token vào state và localStorage.
  const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Đăng nhập thất bại');
    }

    const data = await response.json();
    setUserInfo(data);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
    return data;
  };

  // Gọi API đăng ký, tự động đăng nhập sau khi tạo tài khoản.
  const register = async (name, email, password) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Tạo tài khoản thất bại');
    }

    const data = await response.json();
    setUserInfo(data);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
    return data;
  };

  // Đăng xuất và xóa dữ liệu phiên hiện tại.
  const logout = () => {
    setUserInfo(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  // Memo hóa context value để tránh render lại không cần thiết.
  const contextValue = useMemo(
    () => ({
      userInfo,
      login,
      register,
      logout,
    }),
    [userInfo]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
