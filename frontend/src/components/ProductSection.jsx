import ProductCard from './ProductCard';

const ProductSection = ({ title, products = [], filters = ['Apple', 'Samsung', 'Xiaomi'] }) => {
  return (
    <section className="max-w-7xl mx-auto mt-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold uppercase text-gray-900">{title}</h2>
        
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

export default ProductSection;
