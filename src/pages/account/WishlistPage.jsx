import { ArrowRight, Heart, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { useShop } from '../../context/ShopContext';
import ProductCard from '../../components/product/ProductCard';

export default function WishlistPage() {
  const { wishlistProducts } = useShop();
  const savedProducts = wishlistProducts || [];

  return (
    <MainLayout>
      <section className="container-shell py-8 sm:py-10">
        <div className="overflow-hidden rounded-[2rem] bg-stone-950 text-white">
          <div className="relative px-6 py-9 sm:px-10 sm:py-12">
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-violet-600/25 blur-3xl" />
            <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-fuchsia-500/15 blur-3xl" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-violet-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  NovaWear picks
                </div>
                <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                  Sản phẩm yêu thích
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-stone-300 sm:text-base">
                  Lưu lại những thiết kế bạn thích để dễ dàng quay lại xem và mua sắm bất cứ lúc nào.
                </p>
              </div>

              <div className="flex w-fit items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-stone-950">
                  <Heart className="h-5 w-5 fill-current" />
                </span>
                <div>
                  <p className="text-2xl font-black leading-none">{savedProducts.length}</p>
                  <p className="mt-1 text-xs font-semibold text-stone-300">sản phẩm đã lưu</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {savedProducts.length === 0 ? (
          <EmptyWishlist />
        ) : (
          <>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">
                  Danh sách của bạn
                </p>
                <h2 className="mt-2 text-2xl font-black text-stone-900">Những món đồ bạn đã chọn</h2>
              </div>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-sm font-bold text-stone-700 transition hover:text-violet-700"
              >
                Khám phá thêm <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="product-grid mt-6">
              {savedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <Benefit
                icon={ShoppingBag}
                title="Mua sắm nhanh chóng"
                description="Thêm sản phẩm phù hợp vào giỏ hàng ngay từ danh sách yêu thích."
              />
              <Benefit
                icon={ShieldCheck}
                title="Lựa chọn thật dễ dàng"
                description="So sánh lại những sản phẩm bạn quan tâm trước khi quyết định."
              />
            </div>
          </>
        )}
      </section>
    </MainLayout>
  );
}

function EmptyWishlist() {
  return (
    <div className="mt-8 overflow-hidden rounded-[2rem] border border-stone-200 bg-white px-6 py-14 text-center shadow-sm sm:px-10 sm:py-20">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-50 text-violet-600">
        <Heart className="h-9 w-9" />
      </div>
      <h2 className="mt-6 text-2xl font-black text-stone-900">Danh sách yêu thích đang trống</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-500">
        Nhấn vào biểu tượng trái tim trên sản phẩm để lưu lại những món đồ bạn đang quan tâm.
      </p>
      <Link
        to="/products"
        className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-stone-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-violet-700"
      >
        Khám phá sản phẩm
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function Benefit({ icon: Icon, title, description }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-5">
      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h3 className="font-black text-stone-900">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-stone-500">{description}</p>
      </div>
    </div>
  );
}
