import { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const HamburgerIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
);

const SearchIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

const ClipboardIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="8" y="3" width="8" height="4" rx="1" />
    <path d="M6 7h12v14H6z" />
  </svg>
);

const CartIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="20" r="1" />
    <circle cx="17" cy="20" r="1" />
    <path d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.76L20 7H7" />
  </svg>
);

const UserIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

// Nút tác vụ dùng lại cho giỏ hàng/đơn hàng/tài khoản.
const ActionButton = ({ icon, label, badge, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="relative flex items-center gap-1 text-left text-xs text-white hover:opacity-90"
  >
    {icon}
    <span className="leading-tight">{label}</span>
    {badge ? (
      <span className="absolute -right-2 -top-2 rounded-full bg-orange-400 px-1.5 py-0.5 text-[10px] font-bold text-white">
        {badge}
      </span>
    ) : null}
  </button>
);

// Header chính: tìm kiếm, danh mục, user menu và điều hướng nhanh.
const Header = () => {
  const { userInfo, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [keyword, setKeyword] = useState('');
  const [categories, setCategories] = useState([]);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Đồng bộ keyword theo query ?search trên URL.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setKeyword(params.get('search') || '');
  }, [location.search]);

  useEffect(() => {
    // Tải danh mục để hiển thị menu nhanh trong header.
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setCategories(data);
      } catch (_error) {
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    setIsCategoryMenuOpen(false);
  }, [location.pathname, location.search]);

  // Submit ô tìm kiếm và điều hướng về trang chủ có query.
  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const trimmedKeyword = keyword.trim();

    if (trimmedKeyword) {
      navigate(`/?search=${encodeURIComponent(trimmedKeyword)}`);
      return;
    }

    navigate('/');
  };

  // Đăng xuất tài khoản hiện tại.
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Mở/đóng menu danh mục.
  const handleToggleCategoriesMenu = () => {
    setIsCategoryMenuOpen((prev) => !prev);
  };

  // Điều hướng đến trang tra cứu đơn hàng của user.
  const handleLookupOrders = () => {
    if (!userInfo?.token) {
      navigate('/login');
      return;
    }

    navigate('/my-orders');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#d70018] shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-2 gap-2">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-xl font-bold text-white">
            CellphoneS
          </Link>
          <button
            type="button"
            onClick={handleToggleCategoriesMenu}
            className="flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-white"
          >
            <HamburgerIcon />
            <span>Danh mục</span>
          </button>
        </div>

        <div className="flex-1 max-w-xl">
          <form onSubmit={handleSearchSubmit} className="flex items-center rounded-lg bg-white px-3 py-2">
            <input
              type="text"
              placeholder="Bạn cần tìm gì?"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none"
            />
            <button type="submit" className="text-gray-500 hover:text-gray-700" aria-label="Tìm kiếm">
              <SearchIcon />
            </button>
          </form>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <ActionButton icon={<ClipboardIcon />} label="Tra cứu đơn hàng" onClick={handleLookupOrders} />
          <ActionButton icon={<CartIcon />} label="Giỏ hàng" badge={cartCount} onClick={() => navigate('/cart')} />
          {userInfo ? (
            <>
              <Link to="/my-orders" className="text-xs font-medium text-white hover:opacity-90">
                Đơn hàng của tôi
              </Link>
              <div className="flex items-center space-x-3">
                <ActionButton icon={<UserIcon />} label={`Chào, ${userInfo.name}`} />
                {userInfo.isAdmin ? (
                  <a
                    href={process.env.VITE_ADMIN_URL || 'http://localhost:5174'}
                    className="rounded-md bg-gray-800 px-3 py-1 text-xs font-medium text-white hover:bg-gray-700"
                  >
                    Trang Quản Trị
                  </a>
                ) : null}
                <ActionButton icon={<UserIcon />} label="Đăng xuất" onClick={handleLogout} />
              </div>
            </>
          ) : (
            <ActionButton icon={<UserIcon />} label="Đăng nhập" onClick={() => navigate('/login')} />
          )}
        </div>
      </div>

      {isCategoryMenuOpen ? (
        <>
          <button
            type="button"
            aria-label="Đóng menu danh mục"
            onClick={() => setIsCategoryMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[1px]"
          />

          <div className="absolute left-0 right-0 top-full z-50">
            <div className="max-w-7xl mx-auto px-2 pt-2">
              <div className="w-full max-w-[320px] rounded-xl bg-white p-2 shadow-xl">
                {categories.map((category) => (
                  <Link
                    key={category._id}
                    to={`/category/${category._id}`}
                    onClick={() => setIsCategoryMenuOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-[#d70018]"
                  >
                    <span className="flex items-center gap-3">
                      <span className="inline-block h-2 w-2 rounded-full bg-gray-300" />
                      {category.name}
                    </span>
                    <span className="text-gray-400">
                      <ChevronRightIcon />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
};

export default Header;
