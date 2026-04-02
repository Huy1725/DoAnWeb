import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MainContent } from '../components/MainLayout';
import ProductSection from '../components/ProductSection';

const CategoryProductsPage = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState('Danh mục');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/products?category=${encodeURIComponent(categoryId)}`
        );

        if (!response.ok) {
          throw new Error('Không thể tải sản phẩm theo danh mục');
        }

        const data = await response.json();
        setProducts(data);

        if (data.length > 0 && data[0].category?.name) {
          setCategoryName(data[0].category.name);
        }
      } catch (err) {
        setError(err.message || 'Đã xảy ra lỗi khi tải sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [categoryId]);

  return (
    <MainContent>
      <h1 className="mb-4 text-2xl font-bold text-gray-900">Sản phẩm danh mục: {categoryName}</h1>

      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-600">
          Đang tải sản phẩm...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      ) : products.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-600">
          Danh mục này chưa có sản phẩm.
        </div>
      ) : (
        <ProductSection title={categoryName} products={products} />
      )}
    </MainContent>
  );
};

export default CategoryProductsPage;
