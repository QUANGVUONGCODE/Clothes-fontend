import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronRight,
  LockKeyhole,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import { useShop } from '../../context/ShopContext';
import { products } from '../../data/products';
import { getProductById, getProductImageUrl } from '../../services/productService';
import { formatCurrency } from '../../utils/format';

export default function CartPage() {
  const { cartItems, updateCartItemQuantity, removeFromCart, cartTotal } = useShop();
  const [productImages, setProductImages] = useState({});
  const [removeTarget, setRemoveTarget] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const missingProducts = cartItems.filter(
      (item) => !item.imageUrl && !(item.id in productImages),
    );

    if (missingProducts.length === 0) return undefined;

    Promise.all(
      missingProducts.map(async (item) => {
        try {
          const product = await getProductById(item.id);
          return [item.id, product?.thumbnail ? getProductImageUrl(product.thumbnail) : null];
        } catch (error) {
          console.error('Không thể tải ảnh sản phẩm:', item.id, error);
          return [item.id, null];
        }
      }),
    ).then((entries) => {
      if (!cancelled) setProductImages((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
    });

    return () => {
      cancelled = true;
    };
  }, [cartItems, productImages]);

  const totalQuantity = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  const getItemImage = (item) => {
    if (item.imageUrl) {
      if (item.imageUrl.startsWith('http') || item.imageUrl.startsWith('/')) return item.imageUrl;
      return getProductImageUrl(item.imageUrl);
    }
    return productImages[item.id] || products.find((product) => product.id === item.id)?.images?.[0] || '/placeholder.jpg';
  };

  const confirmRemove = () => {
    if (!removeTarget) return;
    removeFromCart(removeTarget.productVariantId);
    setRemoveTarget(null);
  };

  return (
    <MainLayout>
      <section className="container-shell py-8 sm:py-10">
        <CartSteps />

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-600">NovaWear bag</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">Giỏ hàng của bạn</h1>
            <p className="mt-2 text-sm text-stone-500">
              {cartItems.length > 0
                ? `${totalQuantity} sản phẩm đang chờ bạn hoàn tất đơn hàng.`
                : 'Giỏ hàng hiện chưa có sản phẩm.'}
            </p>
          </div>
          {cartItems.length > 0 && (
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-stone-700 hover:text-violet-700">
              Tiếp tục mua sắm <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {cartItems.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="h-5 w-5 text-violet-600" />
                    <h2 className="font-black text-stone-900">Sản phẩm trong giỏ</h2>
                  </div>
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-500">
                    {cartItems.length} dòng
                  </span>
                </div>

                <div className="divide-y divide-stone-100">
                  {cartItems.map((item) => (
                    <CartItem
                      key={`${item.productVariantId || item.id}-${item.selectedColor}-${item.selectedSize}`}
                      item={item}
                      image={getItemImage(item)}
                      onDecrease={() => updateCartItemQuantity(item.productVariantId, -1)}
                      onIncrease={() => updateCartItemQuantity(item.productVariantId, 1)}
                      onRemove={() => setRemoveTarget(item)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <OrderSummary cartTotal={cartTotal} totalQuantity={totalQuantity} />
          </div>
        )}
      </section>

      {removeTarget && (
        <RemoveItemModal
          item={removeTarget}
          onClose={() => setRemoveTarget(null)}
          onConfirm={confirmRemove}
        />
      )}
    </MainLayout>
  );
}

function CartSteps() {
  return (
    <div className="flex items-center justify-center gap-2 overflow-x-auto rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm sm:gap-5">
      <Step label="Giỏ hàng" active number="1" />
      <ChevronRight className="h-4 w-4 flex-shrink-0 text-stone-300" />
      <Step label="Thông tin" number="2" />
      <ChevronRight className="h-4 w-4 flex-shrink-0 text-stone-300" />
      <Step label="Hoàn tất" number="3" />
    </div>
  );
}

function Step({ label, active, number }) {
  return (
    <div className={`flex flex-shrink-0 items-center gap-2 text-xs font-bold sm:text-sm ${active ? 'text-violet-700' : 'text-stone-400'}`}>
      <span className={`flex h-7 w-7 items-center justify-center rounded-full ${active ? 'bg-violet-100' : 'bg-stone-100'}`}>
        {number}
      </span>
      {label}
    </div>
  );
}

function CartItem({ item, image, onDecrease, onIncrease, onRemove }) {
  return (
    <article className="grid gap-4 p-5 sm:grid-cols-[110px_minmax(0,1fr)_auto] sm:items-center sm:p-6">
      <Link to={`/products/${item.id}`} className="relative h-32 overflow-hidden rounded-2xl bg-stone-100 sm:h-28">
        <img
          src={image}
          alt={item.name}
          className="h-full w-full object-cover transition duration-300 hover:scale-105"
          onError={(event) => { event.currentTarget.src = '/placeholder.jpg'; }}
        />
      </Link>

      <div className="min-w-0">
        <Link to={`/products/${item.id}`} className="line-clamp-2 text-base font-black text-stone-900 hover:text-violet-700">
          {item.name}
        </Link>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
            Màu: {item.selectedColor || '—'}
          </span>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
            Size: {item.selectedSize || '—'}
          </span>
        </div>
        <p className="mt-4 text-lg font-black text-stone-900">{formatCurrency(item.price)}</p>
      </div>

      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
        <div className="inline-flex items-center overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
          <button
            type="button"
            onClick={onDecrease}
            disabled={item.quantity <= 1}
            className="flex h-10 w-10 items-center justify-center text-stone-600 hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Giảm số lượng"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="flex h-10 min-w-10 items-center justify-center border-x border-stone-200 bg-white text-sm font-black">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={onIncrease}
            className="flex h-10 w-10 items-center justify-center text-stone-600 hover:bg-white"
            aria-label="Tăng số lượng"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="text-right">
          <p className="text-xs text-stone-400">Thành tiền</p>
          <p className="mt-1 font-black text-stone-900">{formatCurrency(item.price * item.quantity)}</p>
          <button
            type="button"
            onClick={onRemove}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-3.5 w-3.5" /> Xóa
          </button>
        </div>
      </div>
    </article>
  );
}

function OrderSummary({ cartTotal, totalQuantity }) {
  return (
    <aside className="h-fit overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-xl lg:sticky lg:top-24">
      <div className="bg-stone-950 px-6 py-5 text-white">
        <p className="text-xs uppercase tracking-widest text-white/45">Thanh toán</p>
        <h2 className="mt-1 text-xl font-black">Tóm tắt đơn hàng</h2>
      </div>

      <div className="p-6">
        <div className="space-y-4 text-sm">
          <div className="flex justify-between text-stone-500">
            <span>Sản phẩm ({totalQuantity})</span>
            <span className="font-bold text-stone-900">{formatCurrency(cartTotal)}</span>
          </div>
          <div className="flex justify-between text-stone-500">
            <span>Phí vận chuyển</span>
            <span className="font-bold text-emerald-600">Miễn phí</span>
          </div>
          <div className="flex justify-between text-stone-500">
            <span>Giảm giá</span>
            <span className="font-bold text-stone-900">—</span>
          </div>
        </div>

        <div className="mt-6 flex items-end justify-between border-t border-dashed border-stone-200 pt-5">
          <div>
            <p className="text-sm font-bold text-stone-900">Tổng cộng</p>
            <p className="mt-1 text-xs text-stone-400">Đã bao gồm thuế</p>
          </div>
          <p className="text-2xl font-black text-stone-950">{formatCurrency(cartTotal)}</p>
        </div>

        <Link
          to="/checkout"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-4 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
        >
          Tiến hành thanh toán <ArrowRight className="h-4 w-4" />
        </Link>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <TrustItem icon={LockKeyhole} text="Thanh toán bảo mật" />
          <TrustItem icon={ShieldCheck} text="Đổi trả dễ dàng" />
        </div>
      </div>
    </aside>
  );
}

function TrustItem({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-stone-50 p-3 text-[11px] font-semibold text-stone-500">
      <Icon className="h-4 w-4 flex-shrink-0 text-emerald-600" />
      {text}
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="mt-8 overflow-hidden rounded-[2rem] border border-dashed border-stone-300 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-50">
        <Package className="h-9 w-9 text-violet-500" />
      </div>
      <h2 className="mt-6 text-2xl font-black text-stone-900">Giỏ hàng đang trống</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
        Khám phá các sản phẩm mới và thêm những món đồ phù hợp vào giỏ hàng.
      </p>
      <Link
        to="/"
        className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-stone-900 px-6 py-3.5 text-sm font-bold text-white hover:bg-stone-800"
      >
        Tiếp tục mua sắm <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function RemoveItemModal({ item, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <button type="button" onClick={onClose} className="ml-auto flex rounded-xl p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700">
          <X className="h-5 w-5" />
        </button>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
          <Trash2 className="h-7 w-7 text-red-600" />
        </div>
        <h3 className="mt-5 text-center text-xl font-black text-stone-900">Xóa sản phẩm khỏi giỏ?</h3>
        <p className="mt-2 text-center text-sm leading-6 text-stone-500">
          <span className="font-semibold text-stone-800">{item.name}</span> sẽ được xóa khỏi giỏ hàng của bạn.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-stone-200 px-4 py-3 text-sm font-bold text-stone-700 hover:bg-stone-50">
            Giữ lại
          </button>
          <button type="button" onClick={onConfirm} className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700">
            Xóa sản phẩm
          </button>
        </div>
      </div>
    </div>
  );
}
