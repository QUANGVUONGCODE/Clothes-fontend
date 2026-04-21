import { Link } from 'react-router-dom';

export default function MegaMenu({ item }) {
  return (
    <div className="absolute left-0 top-full hidden w-[720px] rounded-3xl border border-brand-100 bg-white p-6 shadow-soft group-hover:block">
      <div className="grid grid-cols-2 gap-6">
        {(item.megaMenu || []).map((group) => (
          <div key={group.title}>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-500">{group.title}</h4>
            <div className="space-y-3 text-sm">
              {group.items.map((subItem) => (
                <Link key={subItem} to={item.path} className="block hover:text-accent">
                  {subItem}
                </Link>
              ))}
            </div>
          </div>
        ))}
        {item.featured ? (
          <div className="col-span-2 rounded-3xl bg-brand-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Gợi ý nhanh</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {item.featured.map((feature) => (
                <span key={feature} className="rounded-full bg-white px-3 py-2 text-sm text-brand-700">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
