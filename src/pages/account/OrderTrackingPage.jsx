import MainLayout from '../../layouts/MainLayout';

export default function OrderTrackingPage() {
  return (
    <MainLayout>
      <section className="container-shell py-8">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-brand-100 p-8 shadow-card">
          <h1 className="text-4xl font-bold">Tra cứu đơn hàng</h1>
          <p className="mt-4 text-sm leading-7 text-brand-600">Nhập mã đơn hàng và số điện thoại để kiểm tra trạng thái xử lý, giao hàng hoặc hoàn tất.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <input className="input-base" placeholder="Mã đơn hàng" />
            <input className="input-base" placeholder="Số điện thoại" />
          </div>
          <button className="btn-primary mt-6">Tra cứu ngay</button>
          <div className="mt-8 rounded-3xl bg-brand-50 p-6 text-sm leading-7 text-brand-700">
            Trạng thái mẫu: Đơn hàng đang được đóng gói và dự kiến giao trong 1-2 ngày làm việc.
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
