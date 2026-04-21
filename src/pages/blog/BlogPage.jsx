import MainLayout from '../../layouts/MainLayout';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import { blogPosts } from '../../data/blogs';
import { Link } from 'react-router-dom';

export default function BlogPage() {
  return (
    <MainLayout>
      <section className="container-shell py-8">
        <Breadcrumbs items={[{ label: 'Blog', path: '/blog' }]} />
        <div className="mb-10 max-w-2xl">
          <h1 className="text-4xl font-bold">Blog thời trang & phong cách sống</h1>
          <p className="mt-4 text-sm leading-7 text-brand-600">Không gian nội dung mô phỏng cho thương hiệu, phù hợp phát triển thêm SEO và chiến lược content.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-card">
              <img src={post.image} alt={post.title} className="aspect-[4/3] w-full object-cover" />
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">{post.category}</p>
                <h2 className="mt-3 text-xl font-semibold">{post.title}</h2>
                <p className="mt-3 text-sm leading-6 text-brand-600">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </MainLayout>
  );
}
