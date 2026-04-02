import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

// Trang chi tiết sản phẩm: hiển thị biến thể, thông số và thao tác mua.
const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [mainImage, setMainImage] = useState('');

  useEffect(() => {
    // Tải chi tiết sản phẩm theo id từ URL.
    const fetchProductById = async () => {
      try {
        const response = await fetch(`/api/products/${id}`);

        if (!response.ok) {
          throw new Error('Không tìm thấy sản phẩm hoặc có lỗi từ server');
        }

        const data = await response.json();
        setProduct(data);
        setMainImage(`/api/products/${data._id}/image`);
      } catch (err) {
        setError(err.message || 'Đã xảy ra lỗi khi tải chi tiết sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProductById();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="flex min-h-[320px] items-center justify-center text-gray-600">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          Không tìm thấy sản phẩm.
        </div>
      </div>
    );
  }

  const variants =
    Array.isArray(product.variants) && product.variants.length > 0
      ? product.variants
      : [
          { label: '128GB', price: product.price },
          { label: '256GB', price: product.price },
          { label: '512GB', price: product.originalPrice || product.price },
          { label: '1TB', price: product.originalPrice || product.price },
        ];

  const selectedVariantData = variants[selectedVariant] || variants[0];
  const productInfo =
    product.productInfo ||
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc finibus consequat est, vel tristique velit ultricies non.';
  const specifications =
    Array.isArray(product.specifications) && product.specifications.length > 0
      ? product.specifications
      : [
          { key: 'Màn hình', value: '6.7 inch OLED' },
          { key: 'Chip', value: 'Apple A17 Pro' },
          { key: 'RAM', value: '8GB' },
          { key: 'Bộ nhớ', value: '256GB / 512GB / 1TB' },
          { key: 'Pin', value: '4.422 mAh' },
        ];

  // Mua ngay: thêm vào giỏ rồi điều hướng sang trang giỏ.
  const handleBuyNow = () => {
    addToCart(product);
    navigate('/cart');
  };

  // Thêm sản phẩm vào giỏ và tiếp tục ở lại trang chi tiết.
  const handleAddToCart = () => {
    addToCart(product);
  };

  const categoryId = typeof product.category === 'object' ? product.category?._id : product.category;
  const categoryName = typeof product.category === 'object' ? product.category?.name : 'Điện thoại';

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <nav className="mb-4 text-sm text-gray-500">
        <Link to="/" className="hover:text-[#d70018]">
          Trang chủ
        </Link>{' '}
        &gt;{' '}
        {categoryId ? (
          <Link to={`/category/${categoryId}`} className="mx-1 hover:text-[#d70018]">
            {categoryName || 'Điện thoại'}
          </Link>
        ) : (
          <span className="mx-1">{categoryName || 'Điện thoại'}</span>
        )}{' '}
        &gt; <span className="text-gray-700">{product.name}</span>
      </nav>

      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="col-span-1 md:col-span-5">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <img src={mainImage} alt={product.name} className="h-96 w-full object-contain" />
          </div>
        </div>

        <div className="col-span-1 md:col-span-7 space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center gap-0.5 text-yellow-400">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span key={index}>{index < (product.rating || 5) ? '★' : '☆'}</span>
                ))}
              </div>
              <span className="text-sm text-gray-500">150 đánh giá</span>
            </div>
          </div>

          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-[#d70018]">{selectedVariantData?.price || product.price}</span>
            <span className="text-lg text-gray-400 line-through">{product.originalPrice}</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-700">Phiên bản</h2>
            <div className="grid grid-cols-3 gap-2">
              {variants.map((variant, index) => (
                <button
                  key={variant.label}
                  type="button"
                  onClick={() => setSelectedVariant(index)}
                  className={`relative rounded-lg border p-2 text-left transition ${
                    selectedVariant === index
                      ? 'border-[#d70018] bg-red-50'
                      : 'border-gray-200 bg-white hover:border-[#d70018]'
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-800">{variant.label}</p>
                  <p className="text-xs text-gray-500">{variant.price}</p>
                  {selectedVariant === index ? (
                    <span className="absolute right-2 top-2 text-[#d70018]">✓</span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <h3 className="font-semibold text-[#d70018]">🎁 Khuyến mãi trị giá 1.500.000đ</h3>
            <ul className="mt-2 space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Thu cũ lên đời trợ giá 1 triệu</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Giảm thêm 500k khi thanh toán qua VNPay</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={handleBuyNow}
              className="w-full rounded-lg bg-red-600 px-4 py-3 text-center text-white"
            >
              <span className="block text-base font-bold uppercase">MUA NGAY</span>
              <span className="block text-xs">Giao tận nơi hoặc nhận tại cửa hàng</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-2 rounded-lg border border-red-600 px-4 py-3 font-semibold text-red-600"
              >
                <span>🛒</span>
                <span>THÊM VÀO GIỎ</span>
              </button>
              <button type="button" className="rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white">
                TRẢ GÓP
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-lg font-bold text-gray-800">Đánh giá sản phẩm</h3>
          <p className="text-sm leading-7 text-gray-700 whitespace-pre-line">{productInfo}</p>
        </div>

        <div className="md:col-span-5 rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-lg font-bold text-gray-800">Thông số kỹ thuật</h3>
          <table className="w-full overflow-hidden rounded-lg border border-gray-200 text-sm">
            <tbody>
              {specifications.map((item, index) => (
                <tr key={`${item.key}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border-b border-gray-200 px-3 py-2 font-medium text-gray-700">{item.key}</td>
                  <td className="border-b border-gray-200 px-3 py-2 text-gray-600">{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ProductDetailPage;
