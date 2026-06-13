import { ArrowRight, ArrowUpRight, BookOpen, CalendarDays, Clock3, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import { blogPosts } from '../../data/blogs';

function formatBlogDate(date) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export default function BlogPage() {
  const [featuredPost, ...otherPosts] = blogPosts;

  return (
    <MainLayout>
      <section className="container-shell py-8 sm:py-10">
        <Breadcrumbs items={[{ label: 'Blog', path: '/blog' }]} />

        <header className="relative mt-5 overflow-hidden rounded-[2rem] bg-stone-950 px-6 py-12 text-white sm:px-10 sm:py-16 lg:px-14">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-violet-600/25 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-fuchsia-500/15 blur-3xl" />
          <div className="relative max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-violet-200">
              <Sparkles className="h-3.5 w-3.5" />
              NovaWear Journal
            </span>
            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              Cảm hứng thời trang và phong cách sống
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-stone-300 sm:text-base">
              Khám phá cách phối đồ, lựa chọn chất liệu và những gợi ý thiết thực giúp bạn xây dựng
              phong cách riêng mỗi ngày.
            </p>
          </div>
        </header>

        {featuredPost && <FeaturedPost post={featuredPost} />}

        {otherPosts.length > 0 && (
          <section className="mt-16">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">Đọc thêm</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-stone-900">Bài viết mới nhất</h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-stone-500">
                Những chia sẻ ngắn gọn, dễ áp dụng cho tủ đồ và nhịp sống hiện đại.
              </p>
            </div>

            <div className="mt-7 grid gap-6 md:grid-cols-2">
              {otherPosts.map((post) => (
                <ArticleCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-16 overflow-hidden rounded-[2rem] bg-violet-50 px-6 py-9 sm:px-10 sm:py-11">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white">
                <BookOpen className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-black text-stone-900 sm:text-2xl">Từ cảm hứng đến phong cách của bạn</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                  Khám phá các thiết kế NovaWear và áp dụng ngay những công thức phối đồ trong bài viết.
                </p>
              </div>
            </div>
            <Link
              to="/products"
              className="inline-flex w-fit flex-shrink-0 items-center gap-2 rounded-full bg-stone-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-violet-700"
            >
              Xem sản phẩm
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </section>
    </MainLayout>
  );
}

function FeaturedPost({ post }) {
  return (
    <article className="mt-10 overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
        <Link to={`/blog/${post.slug}`} className="group block overflow-hidden bg-stone-100">
          <img
            src={post.image}
            alt={post.title}
            className="aspect-[16/10] h-full w-full object-cover transition duration-700 group-hover:scale-105 lg:aspect-auto"
          />
        </Link>
        <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-10">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <span className="rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">{post.category}</span>
            <span className="inline-flex items-center gap-1.5 text-stone-400">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatBlogDate(post.date)}
            </span>
          </div>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-stone-400">Bài viết nổi bật</p>
          <Link to={`/blog/${post.slug}`}>
            <h2 className="mt-3 text-2xl font-black leading-tight text-stone-900 transition hover:text-violet-700 sm:text-3xl">
              {post.title}
            </h2>
          </Link>
          <p className="mt-4 text-sm leading-7 text-stone-500">{post.excerpt}</p>
          <div className="mt-7 flex items-center justify-between gap-4 border-t border-stone-100 pt-5">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-stone-400">
              <Clock3 className="h-3.5 w-3.5" />
              4 phút đọc
            </span>
            <Link
              to={`/blog/${post.slug}`}
              className="inline-flex items-center gap-2 text-sm font-bold text-stone-900 transition hover:text-violet-700"
            >
              Đọc bài viết
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function ArticleCard({ post }) {
  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white transition hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/blog/${post.slug}`} className="block overflow-hidden bg-stone-100">
        <img
          src={post.image}
          alt={post.title}
          className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
          <span className="text-violet-700">{post.category}</span>
          <span className="inline-flex items-center gap-1.5 text-stone-400">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatBlogDate(post.date)}
          </span>
        </div>
        <Link to={`/blog/${post.slug}`}>
          <h2 className="mt-4 line-clamp-2 text-xl font-black leading-snug text-stone-900 transition group-hover:text-violet-700">
            {post.title}
          </h2>
        </Link>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-500">{post.excerpt}</p>
        <Link
          to={`/blog/${post.slug}`}
          className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-stone-700 transition hover:text-violet-700"
        >
          Xem chi tiết
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
