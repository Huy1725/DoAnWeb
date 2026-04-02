import { useContext } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminLayout = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="flex w-64 flex-col bg-gray-800 text-white">
        <div className="border-b border-gray-700 p-4 text-xl font-bold">CELLPHONES ADMIN</div>

        <nav className="space-y-1 px-4 py-4 text-sm">
          <Link to="/orders" className="block rounded px-3 py-2 hover:bg-gray-700">
            Quản lý Đơn hàng
          </Link>
          <Link to="/products" className="block rounded px-3 py-2 hover:bg-gray-700">
            Quản lý Sản phẩm
          </Link>
          <Link to="/categories" className="block rounded px-3 py-2 hover:bg-gray-700">
            Quản lý Danh mục
          </Link>
          <Link to="/users" className="block rounded px-3 py-2 hover:bg-gray-700">
            Quản lý Tài khoản
          </Link>
        </nav>

        <div className="mt-auto space-y-2 border-t border-gray-700 p-4">
          <a href={process.env.VITE_FRONTEND_URL || 'http://localhost:5173'} className="block rounded bg-gray-700 px-3 py-2 text-center text-sm hover:bg-gray-600">
            🏠 Xem trang khách
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded bg-red-600 px-3 py-2 text-sm font-semibold hover:bg-red-500"
          >
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
