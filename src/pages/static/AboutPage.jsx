import { ArrowRight, HeartHandshake, Leaf, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import Breadcrumbs from '../../components/common/Breadcrumbs';

const values = [
  {
    icon: Sparkles,
    title: 'Tối giản hiện đại',
    text: 'Thiết kế tinh gọn, dễ phối và phù hợp với nhiều khoảnh khắc trong cuộc sống.',
  },
  {
    icon: ShieldCheck,
    title: 'Chất lượng đáng tin',
    text: 'Chú trọng chất liệu, độ hoàn thiện và cảm giác thoải mái khi sử dụng mỗi ngày.',
  },
  {
    icon: HeartHandshake,
    title: 'Khách hàng là trung tâm',
    text: 'Trải nghiệm mua sắm rõ ràng, hỗ trợ tận tâm và chính sách minh bạch.',
  },
  {
    icon: Leaf,
    title: 'Lựa chọn có trách nhiệm',
    text: 'Từng bước tối ưu vật liệu, bao bì và vận hành để hạn chế lãng phí.',
  },
];

const milestones = [
  { value: '2026', label: 'Năm NovaWear bắt đầu hành trình' },
  { value: '100%', label: 'Tập trung vào trải nghiệm khách hàng' },
  { value: '24/7', label: 'Mua sắm trực tuyến thuận tiện' },
];

export default function AboutPage() {
  return (
    <MainLayout>
      <section className="container-shell py-8 sm:py-10">
        <Breadcrumbs items={[{ label: 'Về chúng tôi', path: '/about' }]} />

        <div className="relative mt-5 overflow-hidden rounded-[2rem] bg-stone-950 text-white">
          <img
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1800&q=85"
            alt="Không gian thời trang NovaWear"
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/85 to-stone-950/25" />
          <div className="relative max-w-3xl px-6 py-16 sm:px-10 sm:py-24 lg:px-14 lg:py-28">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-violet-200 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Our story
            </span>
            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-6xl">
              Thời trang dành cho nhịp sống hiện đại
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-stone-200 sm:text-base">
              NovaWear tạo nên những lựa chọn thời trang linh hoạt, dễ mặc và giàu tính ứng dụng,
              giúp bạn tự tin thể hiện phong cách theo cách riêng của mình.
            </p>
            <Link
              to="/products"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-stone-950 transition hover:bg-violet-100"
            >
              Khám phá sản phẩm
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85"
              alt="Phong cách thời trang NovaWear"
              className="aspect-[4/5] w-full rounded-[2rem] object-cover"
            />
            <div className="absolute -bottom-5 -right-2 max-w-[230px] rounded-2xl border border-stone-100 bg-white p-5 shadow-xl sm:right-6">
              <p className="text-3xl font-black text-violet-700">NovaWear</p>
              <p className="mt-2 text-xs font-semibold leading-5 text-stone-500">
                Đơn giản để mặc. Tự tin để khác biệt.
              </p>
            </div>
          </div>

          <div className="lg:pl-8">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-600">Câu chuyện thương hiệu</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">
              Bắt đầu từ mong muốn làm cho việc mặc đẹp trở nên dễ dàng
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-stone-600 sm:text-base">
              <p>
                Chúng tôi tin rằng thời trang đẹp không cần phải phức tạp. Một sản phẩm tốt cần có
                thiết kế phù hợp, chất liệu dễ chịu và đủ linh hoạt để đồng hành cùng người mặc mỗi ngày.
              </p>
              <p>
                Từ việc khám phá sản phẩm đến khi nhận hàng, NovaWear hướng đến một trải nghiệm liền
                mạch, minh bạch và gần gũi. Mỗi lựa chọn đều được xây dựng xoay quanh nhu cầu thực tế
                của khách hàng hiện đại.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {milestones.map((item) => (
                <div key={item.value} className="rounded-2xl bg-stone-50 p-4">
                  <p className="text-xl font-black text-stone-900 sm:text-2xl">{item.value}</p>
                  <p className="mt-2 text-[11px] font-semibold leading-4 text-stone-500 sm:text-xs">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-600">Điều chúng tôi theo đuổi</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">
              Giá trị tạo nên NovaWear
            </h2>
            <p className="mt-4 text-sm leading-7 text-stone-500">
              Những nguyên tắc định hướng cách chúng tôi phát triển sản phẩm và phục vụ khách hàng.
            </p>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-2">
            {values.map(({ icon: Icon, title, text }, index) => (
              <article
                key={title}
                className="group rounded-[1.75rem] border border-stone-200 bg-white p-6 transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg sm:p-7"
              >
                <div className="flex items-start gap-5">
                  <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 transition group-hover:bg-violet-600 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <span className="text-xs font-black text-stone-300">0{index + 1}</span>
                    <h3 className="mt-1 text-lg font-black text-stone-900">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-500">{text}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20 overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-700 to-fuchsia-700 px-6 py-10 text-white sm:px-10 sm:py-12">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-200">Cùng NovaWear</p>
              <h2 className="mt-3 max-w-2xl text-2xl font-black tracking-tight sm:text-3xl">
                Tìm phong cách phù hợp với bạn ngay hôm nay
              </h2>
            </div>
            <Link
              to="/products"
              className="inline-flex w-fit flex-shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-violet-700 transition hover:bg-stone-100"
            >
              Mua sắm ngay
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </section>
    </MainLayout>
  );
}
