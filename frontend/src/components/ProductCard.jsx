import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config/url';

const HeartIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
);

const ProductCard = ({
  discount = 'Giảm 20%',
  image,
  title,
  productId,
  currentPrice,
  originalPrice,
  promo = 'Thu cũ lên đời trợ giá 1 triệu',
  rating = 5,
  stock,
}) => {
  const productLink = productId ? `/product/${productId}` : '#';
  const imageSrc = productId
    ? `${API_BASE_URL}/api/products/${productId}/image`
    : image || 'https://placehold.co/300x300?text=Product';
  const parsedStock = Number(stock);
  const hasStockInfo = Number.isFinite(parsedStock);
  const normalizedStock = hasStockInfo ? Math.max(0, Math.floor(parsedStock)) : null;

  return (
    <Link to={productLink}>
      <article className="relative rounded-xl bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
        <span className="absolute left-3 top-3 rounded bg-[#d70018] px-2 py-1 text-[10px] font-semibold text-white">
          {discount}
        </span>

        <div className="mt-6">
          <img
            src={imageSrc}
            alt={title || 'Product image'}
            className="h-44 w-full object-contain"
          />
        </div>

        <h3 className="mt-2 line-clamp-2 min-h-[40px] text-sm font-bold text-black">{title}</h3>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-[#d70018]">{currentPrice}</span>
          <span className="text-xs text-gray-400 line-through">{originalPrice}</span>
        </div>

        <div className="mt-2 rounded bg-gray-100 p-2 text-xs font-medium text-gray-600">{promo}</div>

        {hasStockInfo ? (
          <p className={`mt-2 text-xs font-semibold ${normalizedStock > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
            {normalizedStock > 0 ? `Tồn kho: ${normalizedStock}` : 'Hết hàng'}
          </p>
        ) : null}

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <span key={index} className={index < rating ? 'text-yellow-400' : 'text-gray-300'}>
                ★
              </span>
            ))}
          </div>
          <button className="text-gray-400 hover:text-[#d70018]" aria-label="Wishlist">
            <HeartIcon />
          </button>
        </div>
      </article>
    </Link>
  );
};

export default ProductCard;
