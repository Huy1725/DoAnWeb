import { Route, Routes } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import AdminOrdersPage from './pages/AdminOrdersPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProductsPage from './pages/AdminProductsPage';
import ProductEditPage from './pages/ProductEditPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminBannersPage from './pages/AdminBannersPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminPromotionsPage from './pages/AdminPromotionsPage';

// Admin app chỉ tập trung route quản trị và login.
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="banners" element={<AdminBannersPage />} />
        <Route path="product/:id/edit" element={<ProductEditPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="promotions" element={<AdminPromotionsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
