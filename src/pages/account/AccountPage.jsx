import MainLayout from '../../layouts/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import OrderHistory from './OrderHistory';

export default function AccountPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-500 to-brand-600 flex items-center justify-center text-2xl font-bold text-white uppercase">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user?.name || 'Chưa có tên'}</h2>
                <p className="text-brand-600">{user?.email || 'Chưa có email'}</p>
                <p className="text-sm text-stone-500">{user?.phone_number || 'Chưa có số điện thoại'}</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Họ và tên</label>
                <input className="input-base" defaultValue={user?.name} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Số điện thoại</label>
                <input className="input-base" defaultValue={user?.phone_number} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Email</label>
              <input className="input-base" defaultValue={user?.email} />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Địa chỉ mặc định</label>
              <textarea className="input-base min-h-32" placeholder="Nhập địa chỉ nhận hàng..." />
            </div>
            <button className="btn-primary">Cập nhật thông tin</button>
          </div>
        );
      case 'orders':
        return <OrderHistory />;
      case 'addresses':
        return <div>Địa chỉ nhận hàng (TODO)</div>;
      case 'promotions':
        return <div>Ưu đãi (TODO)</div>;
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <section className="container-shell py-8">
        <h1 className="text-4xl font-bold">Tài khoản cá nhân</h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-3xl border border-brand-100 p-6 shadow-card">
            <div className="space-y-4">
              <button onClick={() => setActiveTab('profile')} className={`block p-3 rounded-xl w-full text-left hover:bg-brand-50 ${activeTab === 'profile' ? 'bg-brand-100 font-semibold' : ''}`}>Thông tin tài khoản</button>
              <button onClick={() => setActiveTab('orders')} className={`block p-3 rounded-xl w-full text-left hover:bg-brand-50 ${activeTab === 'orders' ? 'bg-brand-100 font-semibold' : ''}`}>Lịch sử mua hàng</button>
              <button onClick={() => setActiveTab('addresses')} className={`block p-3 rounded-xl w-full text-left hover:bg-brand-50 ${activeTab === 'addresses' ? 'bg-brand-100 font-semibold' : ''}`}>Địa chỉ nhận hàng</button>
              <button onClick={() => setActiveTab('promotions')} className={`block p-3 rounded-xl w-full text-left hover:bg-brand-50 ${activeTab === 'promotions' ? 'bg-brand-100 font-semibold' : ''}`}>Ưu đãi của tôi</button>
            </div>
          </aside>
          {renderContent()}
        </div>
      </section>
    </MainLayout>
  );
}

