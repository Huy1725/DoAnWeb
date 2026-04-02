import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';

const FlashSaleSection = ({ products = [] }) => {
  const [timeLeft, setTimeLeft] = useState(5 * 60 * 60 + 25 * 60 + 10);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = String(Math.floor(timeLeft / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');

  return (
    <section className="mt-6 rounded-xl bg-gradient-to-r from-red-800 to-orange-500 p-4">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-bold text-white">HOT SALE CUỐI TUẦN</h2>
        <div className="flex items-center gap-1 text-white">
          {[hours, minutes, seconds].map((value, index) => (
            <div key={`${value}-${index}`} className="flex items-center gap-1">
              <span className="rounded-md bg-black px-2 py-1 text-sm font-semibold text-white">{value}</span>
              {index < 2 ? <span>:</span> : null}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {products.map((product) => (
          <ProductCard
            key={product.id || product.name}
            productId={product._id || product.id}
            discount={product.discountBadge || product.discount}
            image={product.image}
            title={product.name || product.title}
            currentPrice={product.price || product.currentPrice}
            originalPrice={product.originalPrice}
            promo={product.promoText || product.promo}
            rating={product.rating}
          />
        ))}
      </div>
    </section>
  );
};

export default FlashSaleSection;
