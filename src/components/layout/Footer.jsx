import {
  Facebook,
  Instagram,
  Mail,
  Phone,
  Youtube,
  MapPin,
  ArrowRight,
} from "lucide-react";

const footerColumns = [
  {
    title: "NOVACLUB",
    links: [
      "Tài khoản thành viên",
      "Ưu đãi tích điểm",
      "Quyền lợi đặc biệt",
    ],
  },
  {
    title: "CHÍNH SÁCH",
    links: [
      "Chính sách đổi trả",
      "Chính sách giao hàng",
      "Chính sách khuyến mãi",
      "Chính sách bảo mật",
    ],
  },
  {
    title: "CHĂM SÓC KHÁCH HÀNG",
    links: [
      "Trải nghiệm mua sắm",
      "Hỏi đáp - FAQs",
      "Hướng dẫn chọn size",
      "Liên hệ hỗ trợ",
    ],
  },
  {
    title: "VỀ NOVAWEAR",
    links: [
      "Câu chuyện thương hiệu",
      "Hệ thống cửa hàng",
      "Cam kết chất lượng",
      "Định hướng bền vững",
    ],
  },
];

const contactLocations = [
  "Cửa hàng trung tâm: 85 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh",
  "Văn phòng Hà Nội: 120 Cầu Giấy, Quận Cầu Giấy, Hà Nội",
  "Kho vận phía Nam: Khu công nghiệp Tân Bình, TP. Hồ Chí Minh",
];

function Footer() {
  return (
    <footer className="mt-16 bg-black text-white">
      <div className="mx-auto max-w-[1440px] px-4 py-10 lg:px-6">
        {/* Top */}
        <div className="grid grid-cols-1 gap-8 border-b border-white/10 pb-8 lg:grid-cols-[1.1fr_0.9fr_0.8fr]">
          <div>
            <h2 className="text-3xl font-extrabold uppercase tracking-tight">
              NOVAWEAR lắng nghe bạn!
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/75">
              Chúng tôi luôn trân trọng mọi ý kiến đóng góp để không ngừng nâng
              cao trải nghiệm mua sắm và chất lượng sản phẩm dành cho khách hàng.
            </p>

            <button
              type="button"
              className="mt-5 inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-bold uppercase text-black transition hover:bg-white/90"
            >
              Đóng góp ý kiến
              <ArrowRight className="ml-2" size={16} />
            </button>
          </div>

          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <Phone className="mt-1" size={28} />
              <div>
                <p className="text-sm font-semibold uppercase text-white/70">
                  Hotline
                </p>
                <p className="text-2xl font-extrabold">1900.272737 - 028.7777.2737</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Mail className="mt-1" size={28} />
              <div>
                <p className="text-sm font-semibold uppercase text-white/70">
                  Email
                </p>
                <p className="text-2xl font-extrabold">hello@novawear.vn</p>
              </div>
            </div>
          </div>

          <div className="flex items-start justify-start gap-4 lg:justify-end">
            <a
              href="#"
              className="rounded-xl border border-white/30 p-3 transition hover:border-white hover:bg-white/10"
              aria-label="Facebook"
            >
              <Facebook size={24} />
            </a>
            <a
              href="#"
              className="rounded-xl border border-white/30 p-3 transition hover:border-white hover:bg-white/10"
              aria-label="Instagram"
            >
              <Instagram size={24} />
            </a>
            <a
              href="#"
              className="rounded-xl border border-white/30 p-3 transition hover:border-white hover:bg-white/10"
              aria-label="YouTube"
            >
              <Youtube size={24} />
            </a>
          </div>
        </div>

        {/* Middle */}
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 py-10 lg:grid-cols-[1fr_1fr_1fr_1fr_1.4fr]">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-extrabold uppercase">{column.title}</h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-white/75 transition hover:text-white"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-sm font-extrabold uppercase">ĐỊA CHỈ LIÊN HỆ</h3>
            <div className="mt-4 space-y-4">
              {contactLocations.map((location) => (
                <div key={location} className="flex items-start gap-3">
                  <MapPin className="mt-0.5 shrink-0 text-white/70" size={18} />
                  <p className="text-sm leading-6 text-white/75">{location}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col gap-6 py-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase">© Công ty TNHH NovaWear Việt Nam</p>
            <p className="mt-2 max-w-3xl text-xs leading-6 text-white/60">
              Mã số doanh nghiệp: 0101234567. Giấy chứng nhận đăng ký doanh nghiệp
              do Sở Kế hoạch và Đầu tư cấp. Website được xây dựng phục vụ hoạt
              động giới thiệu và kinh doanh sản phẩm thời trang.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-lg bg-white px-4 py-3 text-xs font-bold text-black">
              Secure Checkout
            </div>
            <div className="rounded-lg bg-white px-4 py-3 text-xs font-bold text-black">
              DMCA Protected
            </div>
            <div className="rounded-lg bg-white px-4 py-3 text-xs font-bold text-black">
              Verified Brand
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;