import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

export default function NotFoundPage() {
  return (
    <MainLayout>
      <div className="container-shell flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">404</p>
        <h1 className="mt-4 text-5xl font-bold">Trang không tồn tại</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-brand-600">Đường dẫn bạn truy cập hiện không có sẵn. Hãy quay về trang chủ hoặc tiếp tục khám phá sản phẩm.</p>
        <div className="mt-8 flex gap-4">
          <Link to="/" className="btn-primary">Về trang chủ</Link>
          <Link to="/products" className="btn-secondary">Xem sản phẩm</Link>
        </div>
      </div>
    </MainLayout>
  );
}
