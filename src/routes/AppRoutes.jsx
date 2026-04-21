import { Route, Routes } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import ProductListingPage from '../pages/ProductListingPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import BlogPage from '../pages/blog/BlogPage';
import BlogDetailPage from '../pages/blog/BlogDetailPage';
import AboutPage from '../pages/static/AboutPage';
import AuthPage from '../pages/auth/AuthPage';
import CartPage from '../pages/cart/CartPage';
import CheckoutPage from '../pages/cart/CheckoutPage';
import WishlistPage from '../pages/account/WishlistPage';
import AccountPage from '../pages/account/AccountPage';
import OrderTrackingPage from '../pages/account/OrderTrackingPage';
import NotFoundPage from '../pages/NotFoundPage';
import DepartmentProductPage from '../pages/DepartmentProductPage';
import SubCategoryProductPage from "../pages/SubCategoryProductPage";
import CategoryProductPage from "../pages/CategoryProductPage";
import CreateAccountPage from '../pages/account/CreateAccountPage';
import SearchPage from '../pages/SearchPage';
import AdminLayout from '../pages/admin/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminCategories from '../pages/admin/AdminCategories';
import AdminAttributes from '../pages/admin/AdminAttributes';
import AdminVariants from '../pages/admin/AdminVariants';
import { useAuth } from '../context/AuthContext';

function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  const isAdmin = user?.role?.name === 'ADMIN' || localStorage.getItem('user_role') === 'ROLE_ADMIN';
  if (!user || !isAdmin) return <div>Access denied. Admin only.</div>;
  return children;
}


export default function AppRoutes() {
  return (
    <Routes future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Route path="/" element={<HomePage />} />

      <Route path="/products" element={<ProductListingPage />} />
      <Route path="/men" element={<ProductListingPage title="Thời trang nam" gender="Nam" />} />
      <Route path="/women" element={<ProductListingPage title="Thời trang nữ" gender="Nữ" />} />
      <Route path="/sports" element={<ProductListingPage title="Thể thao" collection="sports" />} />
      <Route path="/accessories" element={<ProductListingPage title="Phụ kiện" collection="accessories" />} />
      <Route path="/sale" element={<ProductListingPage title="Ưu đãi nổi bật" />} />
      <Route path="/collections" element={<ProductListingPage title="Bộ sưu tập" />} />
      <Route path="/collections/:slug" element={<ProductListingPage title="Bộ sưu tập" />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogDetailPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/account/create" element={<CreateAccountPage />} />
      <Route path="/order-tracking" element={<OrderTrackingPage />} />
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/department/:id" element={<DepartmentProductPage />} />
      <Route path="/category/:id" element={<CategoryProductPage />} />
      <Route path="/sub-category/:id" element={<SubCategoryProductPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
<Route path="/admin/*" element={
        <AdminGuard>
          <AdminLayout>
            <Routes>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="variants" element={<AdminVariants />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="attributes" element={<AdminAttributes />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUsers />} />
            </Routes>
          </AdminLayout>
        </AdminGuard>
      } />
    </Routes>
  );
}

