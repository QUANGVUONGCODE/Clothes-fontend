import { Link } from 'react-router-dom';
import { featuredCategories } from '../../data/categories';
import SectionHeader from '../common/SectionHeader';

export default function CategorySection() {
  return (
    <section className="container-shell py-16">
      <SectionHeader
        title="Danh mục nổi bật"
        subtitle="Khám phá các nhóm sản phẩm được tổ chức theo nhu cầu mặc hằng ngày, vận động và di chuyển."
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {featuredCategories.map((item) => (
          <Link key={item.id} to={item.path} className="group overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-card">
            <div className="aspect-[4/5] overflow-hidden">
              <img src={item.image} alt={item.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            </div>
            <div className="p-5">
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="mt-2 text-sm leading-6 text-brand-600">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
