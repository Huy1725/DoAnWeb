import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const AdminCategoriesPage = () => {
  const { userInfo } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');

      if (!response.ok) {
        throw new Error('Không thể tải danh mục');
      }

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (event) => {
    event.preventDefault();

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({ name: categoryName }),
      });

      if (res.ok) {
        setCategoryName('');
        await fetchCategories();
        setError(null);
        return;
      }

      const data = await res.json();
      setError(data.message || 'Đã xảy ra lỗi khi tạo danh mục');
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi tạo danh mục');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa danh mục này?');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể xóa danh mục');
      }

      setCategories((prev) => prev.filter((category) => category._id !== categoryId));
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi xóa danh mục');
    }
  };

  const handleUpdateCategory = async (category) => {
    const newName = window.prompt('Nhập tên mới cho danh mục', category.name);

    if (!newName || !newName.trim()) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${category._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (!response.ok) {
        throw new Error('Không thể cập nhật danh mục');
      }

      const updated = await response.json();
      setCategories((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi cập nhật danh mục');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Quản lý danh mục</h1>

      <form onSubmit={handleCreateCategory} className="mb-4 flex gap-2">
        <input
          type="text"
          value={categoryName}
          onChange={(event) => setCategoryName(event.target.value)}
          placeholder="Tên danh mục"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2"
        />
        <button type="submit" className="rounded-lg bg-[#d70018] px-4 py-2 font-semibold text-white">
          Thêm mới
        </button>
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
                <th className="border-b border-gray-200 px-4 py-3 font-semibold">Tên danh mục</th>
                <th className="border-b border-gray-200 px-4 py-3 font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {categories.map((category) => (
                <tr key={category._id} className="odd:bg-white even:bg-gray-50/40">
                  <td className="border-b border-gray-100 px-4 py-3">{category._id}</td>
                  <td className="border-b border-gray-100 px-4 py-3 font-medium">{category.name}</td>
                  <td className="border-b border-gray-100 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateCategory(category)}
                        className="rounded-md border border-blue-200 px-3 py-1.5 text-xs text-blue-600"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(category._id)}
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

export default AdminCategoriesPage;
