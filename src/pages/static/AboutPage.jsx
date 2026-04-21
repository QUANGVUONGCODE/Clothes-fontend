import MainLayout from '../../layouts/MainLayout';
import Breadcrumbs from '../../components/common/Breadcrumbs';

const blocks = [
  {
    title: 'Câu chuyện thương hiệu',
    text: 'NovaWear được xây dựng như một thương hiệu giả định mang tinh thần thời trang tối giản, linh hoạt và hiện đại, phục vụ nhu cầu mặc đẹp nhưng thực dụng.'
  },
  {
    title: 'Sứ mệnh',
    text: 'Thiết kế trải nghiệm mua sắm trực tuyến rõ ràng, dễ dùng, đồng thời tạo ra sản phẩm có tính ứng dụng cao cho nhiều hoàn cảnh khác nhau.'
  },
  {
    title: 'Giá trị cốt lõi',
    text: 'Tối giản, chính trực, chú trọng chất lượng, và hướng tới sự tiện lợi cho người dùng cuối.'
  },
  {
    title: 'Cam kết chất lượng',
    text: 'Ưu tiên chất liệu phù hợp với khí hậu, kiểm soát tính hoàn thiện và tối ưu phom dáng theo tệp khách hàng mục tiêu.'
  },
  {
    title: 'Cam kết dịch vụ khách hàng',
    text: 'Giao tiếp rõ ràng, hỗ trợ nhanh, và xây dựng quy trình mua hàng minh bạch ở mọi điểm chạm.'
  },
  {
    title: 'Định hướng phát triển bền vững',
    text: 'Hướng tới việc lựa chọn vật liệu, bao bì và cách vận hành hiệu quả hơn để giảm lãng phí trong dài hạn.'
  },
];

export default function AboutPage() {
  return (
    <MainLayout>
      <section className="container-shell py-8">
        <Breadcrumbs items={[{ label: 'Về chúng tôi', path: '/about' }]} />
        <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-start">
          <div>
            <h1 className="text-4xl font-bold">Về NovaWear</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-brand-600">Một trang giới thiệu thương hiệu được xây dựng theo phong cách thời trang hiện đại, phù hợp làm nền tảng cho đồ án tốt nghiệp.</p>
            <div className="mt-10 space-y-6">
              {blocks.map((block) => (
                <div key={block.title} className="rounded-3xl border border-brand-100 p-6 shadow-card">
                  <h2 className="text-xl font-semibold">{block.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-brand-600">{block.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80" alt="lifestyle" className="rounded-[2rem] object-cover" />
            <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80" alt="lifestyle-2" className="rounded-[2rem] object-cover" />
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
