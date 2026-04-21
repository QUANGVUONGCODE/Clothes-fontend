const testimonials = [
  { name: 'Minh Anh', role: 'Khách hàng Hà Nội', text: 'Giao diện dễ dùng, hình ảnh sản phẩm rõ ràng và phần chọn size khá tiện.' },
  { name: 'Tuấn Kiệt', role: 'Nhân viên văn phòng', text: 'Mình thích cách chia bộ sưu tập và combo, rất phù hợp để tham khảo nhanh khi mua.' },
  { name: 'Bảo Trân', role: 'Freelancer', text: 'Phong cách trình bày sạch, hiện đại, không bị rối kể cả khi xem trên điện thoại.' },
];

export default function TestimonialSection() {
  return (
    <section className="container-shell py-16">
      <div className="mb-8">
        <h2 className="section-title">Khách hàng nói gì về NovaWear</h2>
        <p className="section-subtitle">Một số phản hồi mẫu để mô phỏng trải nghiệm mua sắm và tăng độ hoàn thiện cho website demo.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {testimonials.map((item) => (
          <div key={item.name} className="rounded-3xl border border-brand-100 bg-white p-6 shadow-card">
            <p className="text-sm leading-7 text-brand-700">“{item.text}”</p>
            <div className="mt-5">
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-brand-500">{item.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
