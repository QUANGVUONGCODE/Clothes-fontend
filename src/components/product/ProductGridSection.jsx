import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import SectionHeader from '../common/SectionHeader';

export default function ProductGridSection({ title, subtitle, products, actionLink = '/products' }) {
  return (
    <section className="container-shell py-12">
      <SectionHeader
        title={title}
        subtitle={subtitle}
        action={<Link to={actionLink} className="text-sm font-semibold text-brand-900">Xem tất cả</Link>}
      />
      <div className="product-grid">
        {products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}
