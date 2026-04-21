import { Link } from 'react-router-dom';
import { blogPosts } from '../../data/blogs';
import SectionHeader from '../common/SectionHeader';

export default function BlogSection() {
  return (
    <section className="container-shell py-16">
      <SectionHeader title="Blog & mẹo phối đồ" subtitle="Bổ sung nội dung thương hiệu bằng các bài viết ngắn, hữu ích và dễ mở rộng cho SEO sau này." />
      <div className="grid gap-6 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <Link key={post.id} to={`/blog/${post.slug}`} className="overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-card">
            <div className="aspect-[4/3] overflow-hidden">
              <img src={post.image} alt={post.title} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
            </div>
            <div className="p-5">
              <span className="text-xs font-semibold uppercase tracking-wide text-brand-500">{post.category}</span>
              <h3 className="mt-3 line-clamp-2 text-lg font-semibold">{post.title}</h3>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-brand-600">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
