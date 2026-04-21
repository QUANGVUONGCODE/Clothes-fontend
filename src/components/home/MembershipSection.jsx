import { Gift, Crown, UserPlus } from "lucide-react";

const benefits = [
  {
    id: 1,
    title: "Mời bạn bè",
    subtitle: "hoàn tiền 10% NovaCash",
    icon: UserPlus,
  },
  {
    id: 2,
    title: "Hoàn tiền đến 7%",
    subtitle: "",
    icon: Crown,
  },
  {
    id: 3,
    title: "Quà tặng sinh nhật",
    subtitle: "& dịp đặc biệt",
    icon: Gift,
  },
];

const activities = [
  "Chào mừng Minh Anh vừa gia nhập NovaClub.",
  "Khánh Vy vừa nhận 5.000 NovaCash từ đơn hàng gần nhất.",
  "Tuấn Phong vừa được cộng 10.000 NovaCash.",
  "Lan Chi vừa đổi ưu đãi thành công cho đơn thể thao.",
];

function MembershipSection() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-12 lg:px-6">
      <div className="overflow-hidden rounded-[28px] bg-stone-100">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
          {/* Left */}
          <div className="p-6 lg:p-9">
            <h2 className="text-2xl font-extrabold uppercase tracking-tight text-stone-900 lg:text-4xl">
              ĐẶC QUYỀN DÀNH CHO{" "}
              <span className="text-blue-700">515.368</span> THÀNH VIÊN NOVACLUB
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              {benefits.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.id}
                    className="flex min-h-[128px] flex-col justify-between rounded-2xl bg-blue-700 p-5 text-white shadow-sm"
                  >
                    <div>
                      <h3 className="text-lg font-bold leading-snug">
                        {item.title}
                      </h3>
                      {item.subtitle ? (
                        <p className="mt-1 text-lg font-bold leading-snug">
                          {item.subtitle}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex justify-end">
                      <Icon size={26} strokeWidth={2.2} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right */}
          <div className="border-t border-stone-200 p-6 lg:border-l lg:border-t-0 lg:p-9">
            <h3 className="text-xl font-extrabold uppercase text-stone-900 lg:text-3xl">
              HOẠT ĐỘNG GẦN ĐÂY
            </h3>

            <div className="mt-5 max-h-[120px] space-y-3 overflow-hidden text-sm leading-7 text-stone-700 lg:text-base">
              {activities.map((item, index) => (
                <p key={index}>{item}</p>
              ))}
            </div>

            <button
              type="button"
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-black px-6 py-4 text-sm font-extrabold uppercase text-white transition hover:opacity-90"
            >
              GIA NHẬP NOVACLUB NGAY
              <span className="ml-2 text-base">→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MembershipSection;