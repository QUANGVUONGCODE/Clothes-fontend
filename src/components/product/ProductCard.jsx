import { Eye, Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { calculateDiscountPercent, formatCurrency } from '../../utils/format';
import { useShop } from '../../context/ShopContext';

export default function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false);
  const { addToCart, toggleWishlist, wishlist } = useShop();
  const discount = calculateDiscountPercent(product.price, product.originalPrice);

  return (
    <div className="group overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-card">
      <div
        className="relative aspect-[3/4] overflow-hidden bg-brand-50"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <img src={hovered && product.images[1] ? product.images[1] : product.images[0]} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-900">{product.badge}</span>
          {discount > 0 ? <span className="rounded-full bg-brand-900 px-3 py-1 text-xs font-semibold text-white">-{discount}%</span> : null}
        </div>
        <div className="absolute right-4 top-4 flex flex-col gap-2 opacity-0 transition group-hover:opacity-100">
          <button onClick={() => toggleWishlist(product.id)} className="rounded-full bg-white p-2 shadow">
            <Heart className={`h-4 w-4 ${wishlist.includes(product.id) ? 'fill-brand-900 text-brand-900' : ''}`} />
          </button>
          <Link to={`/products/${product.id}`} className="rounded-full bg-white p-2 shadow">
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <div className="p-4">
        <Link to={`/products/${product.id}`} className="line-clamp-2 text-base font-semibold hover:text-accent">
          {product.name}
        </Link>
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="font-bold text-brand-900">{formatCurrency(product.price)}</span>
          {product.originalPrice > product.price ? (
            <span className="text-brand-400 line-through">{formatCurrency(product.originalPrice)}</span>
          ) : null}
        </div>
        <div className="mt-4 flex items-center gap-2">
          {product.colors.slice(0, 4).map((color) => (
            <span key={color} className="rounded-full border border-brand-200 px-2 py-1 text-[11px] text-brand-600">
              {color}
            </span>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.sizes.slice(0, 4).map((size) => (
            <span key={size} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
              {size}
            </span>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button onClick={() => addToCart({
            ...product,
            selectedColor: product.colors[0],
            selectedSize: product.sizes[0]
          })} className="rounded-full bg-brand-900 px-4 py-3 text-xs font-semibold text-white">
            <span className="inline-flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> Thêm nhanh</span>
          </button>
          <Link to={`/products/${product.id}`} className="rounded-full border border-brand-200 px-4 py-3 text-center text-xs font-semibold hover:border-brand-900">
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
}
