import { useParams } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import { blogPosts } from '../../data/blogs';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) {
    return <MainLayout><div className="container-shell py-20">Không tìm thấy bài viết.</div></MainLayout>;
  }

  return (
    <MainLayout>
      <article className="container-shell py-8">
        <Breadcrumbs items={[{ label: 'Blog', path: '/blog' }, { label: post.title, path: `/blog/${post.slug}` }]} />
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">{post.category}</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">{post.title}</h1>
          <p className="mt-3 text-sm text-brand-500">{post.author} · {post.date}</p>
          <img src={post.image} alt={post.title} className="mt-8 aspect-[16/8] w-full rounded-[2rem] object-cover" />
          <div className="prose prose-lg mt-8 max-w-none text-brand-700">
            <p>{post.content}</p>
            <p>Phần nội dung này là dữ liệu mẫu. Bạn có thể thay bằng CMS, API thật hoặc markdown động ở giai đoạn phát triển tiếp theo.</p>
          </div>
        </div>
      </article>
    </MainLayout>
  );
}
