import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Tạo danh sách phiên bản mặc định khi tạo sản phẩm mới.
const createDefaultVariants = () => [
  { label: '128GB', price: '', enabled: false },
  { label: '256GB', price: '', enabled: false },
  { label: '512GB', price: '', enabled: false },
  { label: '1TB', price: '', enabled: false },
];

// Tạo bộ thông số kỹ thuật mặc định cho form sản phẩm.
const createDefaultSpecifications = () => [
  { key: 'Màn hình', value: '' },
  { key: 'Chip', value: '' },
  { key: 'RAM', value: '' },
  { key: 'Bộ nhớ', value: '' },
  { key: 'Pin', value: '' },
];

const defaultSpecifications = createDefaultSpecifications();

// Trang quản trị sản phẩm: CRUD sản phẩm, ảnh, phiên bản và thông số.
const AdminProductsPage = () => {
  const { userInfo } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    price: '',
    originalPrice: '',
    discountBadge: '',
    rating: 5,
    promoText: '',
    productInfo: '',
    category: '',
    variants: createDefaultVariants(),
    specifications: createDefaultSpecifications(),
  });

  // Tải danh sách sản phẩm để hiển thị bảng quản trị.
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');

      if (!response.ok) {
        throw new Error('Không thể tải danh sách sản phẩm');
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Tải danh mục để chọn category khi tạo sản phẩm.
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');

        if (!response.ok) {
          throw new Error('Không thể tải danh mục sản phẩm');
        }

        const data = await response.json();
        setCategories(data);

        if (data.length > 0) {
          setCreateForm((prev) => ({
            ...prev,
            category: prev.category || data[0]._id,
          }));
        }
      } catch (err) {
        setError(err.message || 'Đã xảy ra lỗi khi tải danh mục');
      }
    };

    fetchCategories();
  }, []);

  // Reset toàn bộ form tạo mới về giá trị ban đầu.
  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      price: '',
      originalPrice: '',
      discountBadge: '',
      rating: 5,
      promoText: '',
      productInfo: '',
      category: categories[0]?._id || '',
      variants: createDefaultVariants(),
      specifications: createDefaultSpecifications(),
    });
    setImageFile(null);
  };

  // Mở modal tạo sản phẩm mới.
  const handleOpenCreateModal = () => {
    resetCreateForm();
    setIsCreateModalOpen(true);
  };

  // Cập nhật các field cơ bản trong form tạo.
  const handleCreateInputChange = (event) => {
    const { name, value } = event.target;
    setCreateForm((prev) => ({
      ...prev,
      [name]: name === 'rating' ? Number(value) : value,
    }));
  };

  // Cập nhật giá cho từng phiên bản dung lượng.
  const handleVariantPriceChange = (index, value) => {
    setCreateForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, price: value } : variant
      ),
    }));
  };

  // Bật/tắt trạng thái hoạt động của từng phiên bản.
  const handleVariantEnabledChange = (index, enabled) => {
    setCreateForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, enabled } : variant
      ),
    }));
  };

  // Cập nhật key/value của từng thông số kỹ thuật.
  const handleSpecificationChange = (index, field, value) => {
    setCreateForm((prev) => ({
      ...prev,
      specifications: prev.specifications.map((specification, specIndex) =>
        specIndex === index ? { ...specification, [field]: value } : specification
      ),
    }));
  };

  // Thêm một dòng thông số mới vào form.
  const handleAddSpecification = () => {
    setCreateForm((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }],
    }));
  };

  // Xóa một dòng thông số theo index.
  const handleRemoveSpecification = (index) => {
    setCreateForm((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, specIndex) => specIndex !== index),
    }));
  };

  // Gửi form tạo sản phẩm mới lên backend bằng multipart/form-data.
  const handleCreateProduct = async (event) => {
    event.preventDefault();

    try {
      setIsCreating(true);

      const filteredSpecifications = createForm.specifications.filter(
        (item) => item.key.trim() && item.value.trim()
      );
      const filteredVariants = createForm.variants
        .filter((item) => item.enabled && item.price.trim())
        .map(({ label, price, enabled }) => ({ label, price, enabled }));

      const submitFormData = new FormData();
      submitFormData.append('name', createForm.name);
      submitFormData.append('price', createForm.price);
      submitFormData.append('originalPrice', createForm.originalPrice);
      submitFormData.append('discountBadge', createForm.discountBadge);
      submitFormData.append('rating', String(createForm.rating));
      submitFormData.append('promoText', createForm.promoText);
      submitFormData.append('productInfo', createForm.productInfo);
      submitFormData.append('category', createForm.category);
      submitFormData.append('variants', JSON.stringify(filteredVariants));
      submitFormData.append('specifications', JSON.stringify(filteredSpecifications));

      if (imageFile) {
        submitFormData.append('image', imageFile);
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: submitFormData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || 'Không thể tạo sản phẩm mới';

        if (response.status === 400) {
          alert(errorMessage);
        }

        throw new Error(errorMessage);
      }

      setIsCreateModalOpen(false);
      setError(null);
      await fetchProducts();
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi tạo sản phẩm');
    } finally {
      setIsCreating(false);
    }
  };

  // Xóa sản phẩm theo id sau khi người dùng xác nhận.
  const handleDeleteProduct = async (productId) => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa sản phẩm này?');

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể xóa sản phẩm');
      }

      setProducts((prevProducts) => prevProducts.filter((product) => product._id !== productId));
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi xóa sản phẩm');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="rounded-lg bg-[#d70018] px-4 py-2 text-sm font-semibold text-white"
        >
          Thêm sản phẩm mới
        </button>
      </div>

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Thêm sản phẩm mới</h2>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-600"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  name="name"
                  value={createForm.name}
                  onChange={handleCreateInputChange}
                  placeholder="Tên sản phẩm"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  required
                />
                <select
                  name="category"
                  value={createForm.category}
                  onChange={handleCreateInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  required
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <input
                  name="price"
                  value={createForm.price}
                  onChange={handleCreateInputChange}
                  placeholder="Giá bán"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  required
                />
                <input
                  name="originalPrice"
                  value={createForm.originalPrice}
                  onChange={handleCreateInputChange}
                  placeholder="Giá gốc"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  required
                />
                <input
                  name="discountBadge"
                  value={createForm.discountBadge}
                  onChange={handleCreateInputChange}
                  placeholder="Nhãn giảm giá"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  required
                />
                <input
                  name="promoText"
                  value={createForm.promoText}
                  onChange={handleCreateInputChange}
                  placeholder="Nội dung khuyến mãi"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  required
                />
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  name="rating"
                  value={createForm.rating}
                  onChange={handleCreateInputChange}
                  placeholder="Đánh giá"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  required
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                />
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Phiên bản sản phẩm</h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {createForm.variants.map((variant, index) => (
                    <div key={variant.label} className="rounded-lg border border-gray-200 p-3">
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <input
                          type="checkbox"
                          checked={variant.enabled}
                          onChange={(event) => handleVariantEnabledChange(index, event.target.checked)}
                        />
                        {variant.label}
                      </label>
                      <input
                        type="text"
                        value={variant.price}
                        onChange={(event) => handleVariantPriceChange(index, event.target.value)}
                        placeholder={`Giá ${variant.label}`}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-100"
                        disabled={!variant.enabled}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Thông tin sản phẩm</h3>
                <textarea
                  name="productInfo"
                  value={createForm.productInfo}
                  onChange={handleCreateInputChange}
                  rows={4}
                  placeholder="Mô tả chi tiết sản phẩm"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Thông số kỹ thuật</h3>
                  <button
                    type="button"
                    onClick={handleAddSpecification}
                    className="rounded-md border border-blue-200 px-3 py-1.5 text-xs text-blue-600"
                  >
                    Thêm thông số
                  </button>
                </div>
                <div className="space-y-2">
                  {createForm.specifications.map((specification, index) => (
                    <div key={`${specification.key}-${index}`} className="grid grid-cols-1 gap-2 md:grid-cols-12">
                      <input
                        type="text"
                        value={specification.key}
                        onChange={(event) => handleSpecificationChange(index, 'key', event.target.value)}
                        placeholder="Tên thông số"
                        className="rounded-lg border border-gray-300 px-3 py-2 md:col-span-4"
                      />
                      <input
                        type="text"
                        value={specification.value}
                        onChange={(event) => handleSpecificationChange(index, 'value', event.target.value)}
                        placeholder="Giá trị thông số"
                        className="rounded-lg border border-gray-300 px-3 py-2 md:col-span-7"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecification(index)}
                        className="rounded-lg border border-red-200 px-2 py-2 text-xs text-red-600 md:col-span-1"
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full rounded-lg bg-[#d70018] px-4 py-3 font-bold text-white disabled:opacity-70"
              >
                {isCreating ? 'Đang tạo...' : 'Tạo sản phẩm'}
              </button>
            </form>
          </div>
        </div>
      ) : null}

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
                <th className="border-b border-gray-200 px-4 py-3 font-semibold">DANH MỤC</th>
                <th className="border-b border-gray-200 px-4 py-3 font-semibold">Giá</th>
                <th className="border-b border-gray-200 px-4 py-3 font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {products.map((product) => (
                <tr key={product._id} className="odd:bg-white even:bg-gray-50/40">
                  <td className="border-b border-gray-100 px-4 py-3">{product._id}</td>
                  <td className="border-b border-gray-100 px-4 py-3 font-medium">{product.name}</td>
                  <td className="border-b border-gray-100 px-4 py-3">{product.category?.name || 'Chưa phân loại'}</td>
                  <td className="border-b border-gray-100 px-4 py-3 text-[#d70018]">{product.price}</td>
                  <td className="border-b border-gray-100 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link to={`/product/${product._id}/edit`} className="rounded-md border border-blue-200 px-3 py-1.5 text-xs text-blue-600">
                        Sửa
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product._id)}
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

export default AdminProductsPage;
