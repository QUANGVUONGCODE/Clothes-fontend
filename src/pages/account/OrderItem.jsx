import {
  CircleX,
  Clock3,
  Eye,
  LoaderCircle,
  Loader2,
  MapPin,
  PackageCheck,
  Receipt,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/format';

const STATUS_CONFIG = {
  PENDING: {
    label: 'Chờ xác nhận',
    badge: 'border-amber-200 bg-amber-50 text-amber-700',
    accent: 'bg-amber-400',
    icon: Clock3,
  },
  PROCESSING: {
    label: 'Đang xử lý',
    badge: 'border-blue-200 bg-blue-50 text-blue-700',
    accent: 'bg-blue-500',
    icon: LoaderCircle,
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    badge: 'border-blue-200 bg-blue-50 text-blue-700',
    accent: 'bg-blue-500',
    icon: PackageCheck,
  },
  SHIPPING: {
    label: 'Đang giao hàng',
    badge: 'border-violet-200 bg-violet-50 text-violet-700',
    accent: 'bg-violet-500',
    icon: Truck,
  },
  COMPLETED: {
    label: 'Hoàn thành',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    accent: 'bg-emerald-500',
    icon: PackageCheck,
  },
  CANCELLED: {
    label: 'Đã hủy',
    badge: 'border-red-200 bg-red-50 text-red-700',
    accent: 'bg-red-500',
    icon: CircleX,
  },
};

function normalizeStatus(status) {
  if (status === 'SHIPPED') return 'SHIPPING';
  if (status === 'DELIVERED') return 'COMPLETED';
  return status;
}

function getPaymentMethod(order) {
  const payment = order.payment ?? order.payments;
  return (
    payment?.description ??
    payment?.name ??
    payment?.method ??
    order.paymentMethod ??
    order.payment_method ??
    ''
  );
}

function isEWalletPayment(order, paymentMethod) {
  if (Number(order.payment?.id ?? order.payments?.id ?? order.paymentId ?? order.payment_id) === 2) {
    return true;
  }

  const normalized = String(paymentMethod)
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');

  return (
    ['E_WALLET', 'EWALLET', 'ONLINE', 'VNPAY', 'VN_PAY', 'VÍ_ĐIỆN_TỬ', 'VI_DIEN_TU'].includes(normalized) ||
    normalized.includes('WALLET') ||
    normalized.includes('VNPAY')
  );
}

export default function OrderItem({ order, onViewDetail, onViewInvoice, onCancel, cancelling }) {
  const normalizedStatus = normalizeStatus(order.status);
  const config = STATUS_CONFIG[normalizedStatus] ?? {
    label: order.status,
    badge: 'border-stone-200 bg-stone-100 text-stone-700',
    accent: 'bg-stone-400',
    icon: ShoppingBag,
  };
  const StatusIcon = config.icon;
  const orderCode = order.order_code ?? order.orderCode ?? `#${order.id}`;
  const orderDate = order.order_date ?? order.orderDate ?? order.createdAt;
  const total = order.total_money ?? order.totalMoney ?? 0;
  const paymentMethod = getPaymentMethod(order);
  const canViewInvoice =
    normalizedStatus === 'COMPLETED' ||
    (normalizedStatus === 'CONFIRMED' && isEWalletPayment(order, paymentMethod));
  const canCancel = normalizedStatus === 'PENDING';

  return (
    <article className="group relative overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-xl">
      <div className={`absolute inset-y-0 left-0 w-1.5 ${config.accent}`} />

      <div className="p-5 pl-7 sm:p-7 sm:pl-9">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-stone-900 text-white shadow-lg">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Mã đơn hàng</p>
              <h3 className="mt-1 break-all font-mono text-lg font-black text-stone-900 sm:text-xl">{orderCode}</h3>
              <p className="mt-1 text-sm text-stone-500">{orderDate ? formatDate(orderDate) : 'Chưa có ngày đặt'}</p>
            </div>
          </div>

          <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${config.badge}`}>
            <StatusIcon className={`h-4 w-4 ${normalizedStatus === 'PROCESSING' ? 'animate-spin' : ''}`} />
            {config.label}
          </div>
        </div>

        <div className="mt-6 grid gap-4 border-y border-stone-100 py-5 md:grid-cols-[1fr_1.4fr_auto]">
          <InfoBlock label="Người nhận" value={order.full_name ?? order.fullName ?? '—'} />
          <InfoBlock
            label="Địa chỉ giao hàng"
            value={order.address ?? '—'}
            icon={MapPin}
          />
          <div className="md:text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Tổng thanh toán</p>
            <p className="mt-2 text-2xl font-black text-stone-900">{formatCurrency(total)}</p>
            <p className="mt-1 text-xs text-stone-500">{paymentMethod || 'Thanh toán khi nhận hàng'}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-stone-400">
            Xem sản phẩm trong đơn, trạng thái và gửi đánh giá sau khi hoàn thành.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            {canCancel && (
              <button
                type="button"
                onClick={() => onCancel(order)}
                disabled={cancelling}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <CircleX className="h-4 w-4" />}
                {cancelling ? 'Đang hủy...' : 'Hủy đơn'}
              </button>
            )}
            {canViewInvoice && orderCode && (
              <button
                type="button"
                onClick={() => onViewInvoice(orderCode)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
              >
                <Receipt className="h-4 w-4" />
                Hóa đơn
              </button>
            )}
            <button
              type="button"
              onClick={() => onViewDetail(order)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-stone-800"
            >
              <Eye className="h-4 w-4" />
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function InfoBlock({ label, value, icon: Icon }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">{label}</p>
      <div className="mt-2 flex items-start gap-2">
        {Icon ? <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-stone-400" /> : null}
        <p className="line-clamp-2 text-sm font-semibold leading-6 text-stone-700">{value}</p>
      </div>
    </div>
  );
}
