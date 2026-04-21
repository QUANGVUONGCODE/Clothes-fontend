const benefits = [
  { title: 'Chất liệu tốt', text: 'Ưu tiên độ thoáng khí, êm da và bền sau nhiều lần giặt.' },
  { title: 'Đổi trả dễ dàng', text: 'Chính sách hỗ trợ minh bạch và quy trình đơn giản.' },
  { title: 'Giao hàng nhanh', text: 'Đóng gói gọn gàng, tối ưu trải nghiệm từ online đến nhận hàng.' },
  { title: 'Giá hợp lý', text: 'Thiết kế và chất lượng cân bằng với chi phí dễ tiếp cận.' },
];

export default function BrandBenefits() {
  return (
    <section className="container-shell py-16">
      <div className="rounded-[2rem] bg-brand-50 p-8 md:p-12">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">Lợi ích thương hiệu</p>
          <h2 className="mt-3 text-3xl font-bold">Thiết kế cho trải nghiệm mặc thoải mái, bền và linh hoạt</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="rounded-3xl bg-white p-6 shadow-card">
              <h3 className="text-lg font-semibold">{benefit.title}</h3>
              <p className="mt-3 text-sm leading-6 text-brand-600">{benefit.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
