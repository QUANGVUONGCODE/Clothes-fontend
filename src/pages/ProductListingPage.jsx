import { useMemo, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import Breadcrumbs from '../components/common/Breadcrumbs';
import ProductCard from '../components/product/ProductCard';
import SkeletonCard from '../components/common/SkeletonCard';
import { categoryFilters } from '../data/categories';
import { useProducts } from '../hooks/useProducts';
import { useShop } from '../context/ShopContext';

export default function ProductListingPage({ title = 'Tất cả sản phẩm', gender, collection }) {
  const { searchKeyword } = useShop();
  const [sort, setSort] = useState('newest');
  const [visibleCount, setVisibleCount] = useState(8);
  const [loading] = useState(false);

  const products = useProducts({ gender, collection, search: searchKeyword, sort });

  const banners = useMemo(() => ({
    title,
    subtitle: 'Danh sách sản phẩm được trình bày theo hướng hiện đại, có thể mở rộng thêm API thật sau này.',
  }), [title]);

  return (
    <MainLayout>
      <section className="container-shell py-8">
        <Breadcrumbs items={[{ label: title, path: '/products' }]} />
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-900 text-white">
          <img src={listingBanner.image} alt={title} className="absolute inset-0 h-full w-full object-cover opacity-35" />
          <div className="relative p-10 md:p-14">
            <h1 className="text-3xl font-bold md:text-4xl">{banners.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80">{banners.subtitle}</p>
          </div>
        </div>
      </section>

      <section className="container-shell py-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-3xl border border-brand-100 p-6 shadow-card">
            <h3 className="text-lg font-semibold">Bộ lọc</h3>
            <div className="mt-6 space-y-6">
              <FilterGroup title="Danh mục" items={categoryFilters.category} />
              <FilterGroup title="Màu sắc" items={categoryFilters.colors} />
              <FilterGroup title="Kích thước" items={categoryFilters.sizes} />
              <FilterGroup title="Chất liệu" items={categoryFilters.materials} />
              <FilterGroup title="Mùa sử dụng" items={categoryFilters.season} />
            </div>
          </aside>

          <div>
            <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-brand-100 p-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-brand-600">Hiển thị {Math.min(visibleCount, products.length)} / {products.length} sản phẩm</p>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-base max-w-xs">
                <option value="newest">Mới nhất</option>
                <option value="best-selling">Bán chạy</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
              </select>
            </div>

            <div className="product-grid">
              {loading
                ? Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={index} />)
                : products.slice(0, visibleCount).map((product) => <ProductCard key={product.id} product={product} />)}
            </div>

            {visibleCount < products.length ? (
              <div className="mt-10 text-center">
                <button className="btn-secondary" onClick={() => setVisibleCount((prev) => prev + 4)}>
                  Xem thêm
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

function FilterGroup({ title, items }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-700">{title}</h4>
      <div className="space-y-2">
        {items.map((item) => (
          <label key={item} className="flex items-center gap-3 text-sm text-brand-600">
            <input type="checkbox" className="h-4 w-4 rounded border-brand-300" />
            {item}
          </label>
        ))}
      </div>
    </div>
  );
}
