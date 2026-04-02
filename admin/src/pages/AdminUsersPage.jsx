import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const AdminUsersPage = () => {
  const { userInfo } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users', {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Không thể tải danh sách tài khoản');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi tải người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [userInfo.token]);

  const handleToggleRole = async (user) => {
    try {
      const response = await fetch(`/api/users/${user._id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({ isAdmin: !user.isAdmin }),
      });

      if (!response.ok) {
        throw new Error('Không thể đổi quyền tài khoản');
      }

      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi đổi quyền');
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa tài khoản này?');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể xóa tài khoản');
      }

      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi xóa tài khoản');
    }
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({ name, email, password, isAdmin }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Không thể tạo tài khoản');
      }

      setName('');
      setEmail('');
      setPassword('');
      setIsAdmin(false);
      setError(null);
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi tạo tài khoản');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Quản lý tài khoản</h1>

      <form onSubmit={handleCreateUser} className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Tạo tài khoản mới</h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Họ và tên"
            required
            className="rounded-lg border border-gray-300 px-4 py-2"
          />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            required
            className="rounded-lg border border-gray-300 px-4 py-2"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mật khẩu"
            required
            className="rounded-lg border border-gray-300 px-4 py-2"
          />
          <button type="submit" className="rounded-lg bg-[#d70018] px-4 py-2 font-semibold text-white">
            Tạo tài khoản
          </button>
        </div>

        <label className="mt-3 inline-flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={(event) => setIsAdmin(event.target.checked)}
          />
          Tạo với quyền Admin
        </label>
      </form>

      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-600">Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full border-collapse text-left">
            <thead className="bg-gray-50 text-sm text-gray-700">
              <tr>
                <th className="border-b border-gray-200 px-4 py-3 font-semibold">ID</th>
                <th className="border-b border-gray-200 px-4 py-3 font-semibold">Tên</th>
                <th className="border-b border-gray-200 px-4 py-3 font-semibold">Email</th>
                <th className="border-b border-gray-200 px-4 py-3 font-semibold">Vai trò</th>
                <th className="border-b border-gray-200 px-4 py-3 font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {users.map((user) => (
                <tr key={user._id} className="odd:bg-white even:bg-gray-50/40">
                  <td className="border-b border-gray-100 px-4 py-3">{user._id}</td>
                  <td className="border-b border-gray-100 px-4 py-3 font-medium">{user.name}</td>
                  <td className="border-b border-gray-100 px-4 py-3">{user.email}</td>
                  <td className="border-b border-gray-100 px-4 py-3">
                    {user.isAdmin ? (
                      <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-600">
                        Admin
                      </span>
                    ) : (
                      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-600">
                        Khách hàng
                      </span>
                    )}
                  </td>
                  <td className="border-b border-gray-100 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleRole(user)}
                        disabled={user._id === userInfo._id}
                        className="rounded-md border border-blue-200 px-3 py-1.5 text-xs text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {user._id === userInfo._id ? 'Tài khoản hiện tại' : 'Đổi Quyền'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(user._id)}
                        className="rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
