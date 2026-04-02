import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const FIXED_VARIANT_LABELS = ['128GB', '256GB', '512GB', '1TB'];

// Chuẩn hóa nhãn phiên bản để map dữ liệu ổn định giữa API và UI.
const normalizeVariantLabel = (label = '') => {
  const normalized = String(label).trim().toUpperCase().replace(/\s+/g, '');

  if (normalized === '1024GB') {
    return '1TB';
  }

  return normalized;
};

// Tạo state mặc định cho danh sách phiên bản cố định.
const createDefaultVariants = () =>
  FIXED_VARIANT_LABELS.map((label) => ({
    label,
    price: '',
    enabled: false,
  }));

// Sinh dữ liệu fallback để vẫn hiển thị đủ phiên bản khi API thiếu dữ liệu.
const createFallbackVisibleVariants = (basePrice = '', originalPrice = '') => {
  const normalizedBasePrice = basePrice != null ? String(basePrice) : '';
  const normalizedOriginalPrice =
    originalPrice != null && String(originalPrice).trim()
      ? String(originalPrice)
      : normalizedBasePrice;

  const fallbackPrices = [
    normalizedBasePrice,
    normalizedBasePrice,
    normalizedOriginalPrice,
    normalizedOriginalPrice,
  ];

  return FIXED_VARIANT_LABELS.map((label, index) => ({
    label,
    price: fallbackPrices[index] || '',
    enabled: Boolean((fallbackPrices[index] || '').trim()),
  }));
};

// Chuẩn hóa danh sách phiên bản từ API thành state UI cố định theo 128/256/512/1TB.
const buildVariantsState = (variantsFromApi = [], basePrice = '', originalPrice = '') => {
  if (!Array.isArray(variantsFromApi) || variantsFromApi.length === 0) {
    return createFallbackVisibleVariants(basePrice, originalPrice);
  }

  const variantsMap = new Map(
    variantsFromApi
      .filter((item) => item?.label)
      .map((item) => [
        normalizeVariantLabel(item.label),
        {
          price: item.price != null ? String(item.price) : '',
          enabled: item.enabled !== false,
        },
      ])
  );

  return FIXED_VARIANT_LABELS.map((label) => {
    const matchedVariant = variantsMap.get(normalizeVariantLabel(label));

    if (!matchedVariant) {
      return { label, price: '', enabled: false };
    }

    return {
      label,
      price: matchedVariant.price,
      enabled: Boolean(matchedVariant.enabled || matchedVariant.price),
    };
  });
};

const defaultSpecifications = [
  { key: 'Màn hình', value: '' },
  { key: 'Chip', value: '' },
  { key: 'RAM', value: '' },
  { key: 'Bộ nhớ', value: '' },
  { key: 'Pin', value: '' },
];

// Trang chỉnh sửa sản phẩm trong admin.
const ProductEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    discountBadge: '',
    rating: 0,
    promoText: '',
    productInfo: '',
    variants: createDefaultVariants(),
    specifications: defaultSpecifications,
  });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Tải chi tiết sản phẩm hiện tại để đổ vào form edit.
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`);

        if (!response.ok) {
          throw new Error('Không thể tải thông tin sản phẩm');
        }

        const data = await response.json();
        setFormData({
          name: data.name || '',
          price: data.price || '',
          originalPrice: data.originalPrice || '',
          discountBadge: data.discountBadge || '',
          rating: data.rating || 0,
          promoText: data.promoText || '',
          productInfo: data.productInfo || '',
          variants: buildVariantsState(
            Array.isArray(data.variants) ? data.variants : [],
            data.price || '',
            data.originalPrice || ''
          ),
          specifications:
            Array.isArray(data.specifications) && data.specifications.length > 0
              ? data.specifications
              : defaultSpecifications,
        });
        setSelectedCategory(
          typeof data.category === 'object' ? data.category?._id || '' : data.category || ''
        );
      } catch (err) {
        setError(err.message || 'Đã xảy ra lỗi khi tải sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    // Tải danh mục để chọn category cho sản phẩm.
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');

        if (!response.ok) {
          throw new Error('Không thể tải danh mục');
        }

        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError(err.message || 'Đã xảy ra lỗi khi tải danh mục');
      }
    };

    fetchCategories();
  }, []);

  // Cập nhật các trường cơ bản của form edit.
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rating' ? Number(value) : value,
    }));
  };

  // Bật/tắt trạng thái phiên bản theo index.
  const handleVariantEnabledChange = (index, enabled) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, enabled } : variant
      ),
    }));
  };

  // Cập nhật giá phiên bản theo index.
  const handleVariantPriceChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, price: value } : variant
      ),
    }));
  };

  // Cập nhật key/value của thông số kỹ thuật.
  const handleSpecificationChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.map((specification, specIndex) =>
        specIndex === index ? { ...specification, [field]: value } : specification
      ),
    }));
  };

  // Thêm dòng thông số kỹ thuật mới.
  const handleAddSpecification = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }],
    }));
  };

  // Xóa dòng thông số kỹ thuật theo index.
  const handleRemoveSpecification = (index) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, specIndex) => specIndex !== index),
    }));
  };

  // Submit cập nhật sản phẩm theo id (có thể kèm ảnh mới).
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);

      const submitFormData = new FormData();
      submitFormData.append('name', formData.name);
      submitFormData.append('price', formData.price);
      submitFormData.append('originalPrice', formData.originalPrice);
      submitFormData.append('discountBadge', formData.discountBadge);
      submitFormData.append('rating', String(formData.rating));
      submitFormData.append('promoText', formData.promoText);
      submitFormData.append('productInfo', formData.productInfo || '');
      submitFormData.append('category', selectedCategory);

      const filteredSpecifications = formData.specifications.filter(
        (item) => item.key.trim() && item.value.trim()
      );
      const filteredVariants = formData.variants
        .filter((item) => item.enabled && item.price?.trim())
        .map(({ label, price }) => ({
          label,
          price: price.trim(),
          enabled: true,
        }));

      submitFormData.append('specifications', JSON.stringify(filteredSpecifications));
      submitFormData.append('variants', JSON.stringify(filteredVariants));

      if (imageFile) {
        submitFormData.append('image', imageFile);
      }

      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: submitFormData,
      });

      if (!response.ok) {
        throw new Error('Không thể cập nhật sản phẩm');
      }

      navigate('/products');
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi cập nhật sản phẩm');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto py-8 px-4 text-gray-600">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Chỉnh sửa sản phẩm</h1>

      {error ? <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div> : null}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Tên sản phẩm</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Nhập tên sản phẩm"
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Giá bán</label>
          <input
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Ví dụ: 28.990.000đ"
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Giá gốc</label>
          <input
            name="originalPrice"
            value={formData.originalPrice}
            onChange={handleInputChange}
            placeholder="Ví dụ: 34.990.000đ"
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nhãn giảm giá</label>
          <input
            name="discountBadge"
            value={formData.discountBadge}
            onChange={handleInputChange}
            placeholder="Ví dụ: Giảm 17%"
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Ảnh sản phẩm</label>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setImageFile(event.target.files?.[0] || null)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Đánh giá (0 - 5)</label>
          <input
            type="number"
            min="0"
            max="5"
            name="rating"
            value={formData.rating}
            onChange={handleInputChange}
            placeholder="Nhập điểm đánh giá"
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nội dung khuyến mãi</label>
          <input
            name="promoText"
            value={formData.promoText}
            onChange={handleInputChange}
            placeholder="Ví dụ: Thu cũ lên đời trợ giá 1 triệu"
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Phiên bản sản phẩm</label>
          <div className="space-y-2">
            {formData.variants.map((variant, index) => (
              <label
                key={variant.label}
                className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3 md:flex-row md:items-center"
              >
                <div className="flex items-center gap-2 md:w-40">
                  <input
                    type="checkbox"
                    checked={Boolean(variant.enabled)}
                    onChange={(event) => handleVariantEnabledChange(index, event.target.checked)}
                  />
                  <span className="text-sm font-medium text-gray-700">{variant.label}</span>
                </div>
                <input
                  type="text"
                  value={variant.price}
                  onChange={(event) => handleVariantPriceChange(index, event.target.value)}
                  placeholder="Giá phiên bản"
                  disabled={!variant.enabled}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-100"
                />
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Thông tin sản phẩm</label>
          <textarea
            name="productInfo"
            value={formData.productInfo}
            onChange={handleInputChange}
            rows={5}
            placeholder="Mô tả chi tiết sản phẩm"
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Thông số kỹ thuật</label>
            <button
              type="button"
              onClick={handleAddSpecification}
              className="rounded-md border border-blue-200 px-3 py-1.5 text-xs text-blue-600"
            >
              Thêm thông số
            </button>
          </div>
          <div className="space-y-2">
            {formData.specifications.map((specification, index) => (
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

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Danh mục</label>
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-[#d70018] px-4 py-3 font-bold text-white disabled:opacity-70"
        >
          {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </form>
    </div>
  );
};

export default ProductEditPage;
