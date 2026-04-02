import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MainContent } from '../components/MainLayout';
import HeroSection from '../components/HeroSection';
import ProductSection from '../components/ProductSection';
import FlashSaleSection from '../components/FlashSaleSection';

const HomePage = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const searchKeyword = new URLSearchParams(location.search).get('search') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/products?keyword=${encodeURIComponent(searchKeyword)}`
        );

        if (!response.ok) {
          throw new Error('Không thể tải dữ liệu sản phẩm từ server');
        }

        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message || 'Đã xảy ra lỗi khi tải sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchKeyword]);

  const flashSaleProducts = products.slice(0, 5);
  const phoneProducts = products.slice(0, 5);
  const laptopProducts = products.slice(5, 10);

  return (
    <MainContent>
      <HeroSection />

      {loading ? (
        <div className="flex min-h-[220px] items-center justify-center text-center text-gray-600">
          Đang tải dữ liệu...
        </div>
      ) : error ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600">
          {error}
        </div>
      ) : (
        <>
          <div className="mb-4" />

          <FlashSaleSection products={flashSaleProducts} />

          <ProductSection title="ĐIỆN THOẠI NỔI BẬT" products={phoneProducts} />
          <ProductSection title="LAPTOP BÁN CHẠY" products={laptopProducts} />
        </>
      )}
    </MainContent>
  );
};

export default HomePage;
