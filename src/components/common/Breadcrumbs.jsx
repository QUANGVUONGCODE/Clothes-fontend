import { Link } from 'react-router-dom';

export default function Breadcrumbs({ items }) {
  return (
    <nav className="mb-6 text-sm text-brand-500">
      <div className="flex flex-wrap items-center gap-2">
        <Link to="/" className="hover:text-brand-900">Trang chủ</Link>
        {items.map((item, index) => (
          <span key={item.label} className="flex items-center gap-2">
            <span>/</span>
            {index === items.length - 1 ? (
              <span className="font-medium text-brand-900">{item.label}</span>
            ) : (
              <Link to={item.path} className="hover:text-brand-900">{item.label}</Link>
            )}
          </span>
        ))}
      </div>
    </nav>
  );
}
