import { useState } from 'react';
import {
  Box,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleX,
  Clock3,
  Eye,
  LoaderCircle,
  MapPin,
  PackageCheck,
  PackageSearch,
  Phone,
  ReceiptText,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserRound,
  WalletCards,
} from 'lucide-react';
import { toast } from 'sonner';
import MainLayout from '../../layouts/MainLayout';
import { formatCurrency, formatDate } from '../../utils/format';
import { getOrderDetails } from '../../services/orderService';

const API_BASE = '/shopclothes/api/v1';

const STATUS_STEPS = [
  { statuses: ['PENDING'], label: 'Chờ xác nhận', icon: Clock3 },
  { statuses: ['CONFIRMED', 'PROCESSING'], label: 'Đang xử lý', icon: Box },
  { statuses: ['SHIPPING', 'SHIPPED'], label: 'Đang giao', icon: Truck },
  { statuses: ['COMPLETED', 'DELIVERED'], label: 'Hoàn thành', icon: PackageCheck },
];

const STATUS_CONFIG = {
  PENDING: { label: 'Chờ xác nhận', className: 'border-amber-200 bg-amber-50 text-amber-700', icon: Clock3 },
  CONFIRMED: { label: 'Đã xác nhận', className: 'border-blue-200 bg-blue-50 text-blue-700', icon: CheckCircle2 },
  PROCESSING: { label: 'Đang xử lý', className: 'border-blue-200 bg-blue-50 text-blue-700', icon: LoaderCircle },
  SHIPPING: { label: 'Đang giao', className: 'border-violet-200 bg-violet-50 text-violet-700', icon: Truck },
  SHIPPED: { label: 'Đang giao', className: 'border-violet-200 bg-violet-50 text-violet-700', icon: Truck },
  COMPLETED: { label: 'Hoàn thành', className: 'border-emerald-200 bg-emerald-50 text-emerald-700', icon: PackageCheck },
  DELIVERED: { label: 'Hoàn thành', className: 'border-emerald-200 bg-emerald-50 text-emerald-700', icon: PackageCheck },
  CANCELLED: { label: 'Đã hủy', className: 'border-red-200 bg-red-50 text-red-700', icon: CircleX },
};

function getStatusConfig(status) {
  return STATUS_CONFIG[status] || {
    label: status || 'Chưa cập nhật',
    className: 'border-stone-200 bg-stone-100 text-stone-700',
    icon: Clock3,
  };
}

function getProductImage(detail) {
  const thumbnail = detail.product_variant?.product?.thumbnail;
  return thumbnail
    ? `/shopclothes/api/v1/product-images/images/${thumbnail}`
    : '/placeholder.jpg';
}

export default function OrderTrackingPage() {
  const [orderCode, setOrderCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showProducts, setShowProducts] = useState(false);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const loadDetails = async () => {
    if (showProducts) {
      setShowProducts(false);
      return;
    }
    if (loadingDetails || !result?.id) return;

    try {
      setLoadingDetails(true);
      const details = await getOrderDetails(result.id);
      setOrderDetails(Array.isArray(details) ? details : []);
      setShowProducts(true);
    } catch {
      toast.error('Không thể tải chi tiết đơn hàng.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const trimmedOrderCode = orderCode.trim();
    const trimmedPhoneNumber = phoneNumber.trim();

    if (!trimmedOrderCode || !trimmedPhoneNumber) {
      toast.error('Vui lòng nhập đầy đủ mã đơn hàng và số điện thoại.');
      return;
    }

    setResult(null);
    setShowProducts(false);
    setOrderDetails([]);

    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const url = `${API_BASE}/orders/code-phone?orderCode=${encodeURIComponent(trimmedOrderCode)}&phoneNumber=${encodeURIComponent(trimmedPhoneNumber)}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': 'vi',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await response.json();

      if (!response.ok || data?.code !== 0) {
        toast.error(data?.message || 'Không tìm thấy đơn hàng.');
        return;
      }

      setResult(data?.result ?? data);
    } catch (error) {
      toast.error(error?.message || 'Không thể tra cứu đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <section className="container-shell py-8 sm:py-10">
        <TrackingHero />

        <div className="mx-auto -mt-8 max-w-5xl px-3 sm:-mt-10 sm:px-6">
          <SearchForm
            orderCode={orderCode}
            phoneNumber={phoneNumber}
            loading={loading}
            onOrderCodeChange={setOrderCode}
            onPhoneChange={setPhoneNumber}
            onSubmit={onSubmit}
          />
        </div>

        {result ? (
          <OrderResult
            result={result}
            orderDetails={orderDetails}
            showProducts={showProducts}
            loadingDetails={loadingDetails}
            onToggleDetails={loadDetails}
          />
        ) : (
          <TrackingGuide />
        )}
      </section>
    </MainLayout>
  );
}

function TrackingHero() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-stone-950 via-stone-900 to-violet-950 px-6 pb-20 pt-10 text-white sm:px-10 sm:pb-24 sm:pt-14">
      <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="absolute -bottom-28 left-1/4 h-56 w-56 rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="relative mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-violet-200">
          <PackageSearch className="h-4 w-4" />
          NovaWear Tracking
        </span>
        <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">Theo dõi đơn hàng</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-stone-300 sm:text-base">
          Kiểm tra hành trình đơn hàng của bạn bằng mã đơn và số điện thoại đã dùng khi đặt hàng.
        </p>
      </div>
    </div>
  );
}

function SearchForm({
  orderCode,
  phoneNumber,
  loading,
  onOrderCodeChange,
  onPhoneChange,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="relative rounded-[2rem] border border-stone-200 bg-white p-5 shadow-xl sm:p-7">
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <FormField
          icon={ReceiptText}
          label="Mã đơn hàng"
          placeholder="Ví dụ: ORD-202606..."
          value={orderCode}
          onChange={(event) => onOrderCodeChange(event.target.value)}
        />
        <FormField
          icon={Phone}
          label="Số điện thoại"
          placeholder="Số điện thoại nhận hàng"
          value={phoneNumber}
          onChange={(event) => onPhoneChange(event.target.value)}
          inputMode="tel"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-stone-950 px-6 text-sm font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {loading ? 'Đang tra cứu' : 'Tra cứu'}
        </button>
      </div>
    </form>
  );
}

function FormField({ icon: Icon, label, ...inputProps }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">{label}</span>
      <span className="flex h-12 items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-4 transition focus-within:border-violet-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-50">
        <Icon className="h-4 w-4 flex-shrink-0 text-stone-400" />
        <input
          {...inputProps}
          className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold text-stone-900 outline-none placeholder:font-normal placeholder:text-stone-400"
        />
      </span>
    </label>
  );
}

function OrderResult({ result, orderDetails, showProducts, loadingDetails, onToggleDetails }) {
  const status = result.status;
  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;
  const orderCode = result.order_code ?? result.orderCode;
  const orderDate = result.order_date ?? result.orderDate ?? result.createdAt;
  const customerName = result.full_name ?? result.fullName ?? result.customerName;
  const phone = result.phone_number ?? result.phoneNumber ?? result.customerPhone;
  const address = result.address ?? result.shippingAddress;
  const total = result.total_money ?? result.totalMoney;

  return (
    <div className="mx-auto mt-8 max-w-5xl space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-400" />
        <div className="p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-4">
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-stone-950 text-white">
                <ShoppingBag className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Mã đơn hàng</p>
                <h2 className="mt-1 break-all text-lg font-black text-stone-900 sm:text-2xl">#{orderCode}</h2>
                <p className="mt-1 text-sm text-stone-500">{orderDate ? formatDate(orderDate) : 'Chưa cập nhật ngày đặt'}</p>
              </div>
            </div>
            <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${statusConfig.className}`}>
              <StatusIcon className={`h-4 w-4 ${status === 'PROCESSING' ? 'animate-spin' : ''}`} />
              {statusConfig.label}
            </span>
          </div>

          <OrderTimeline status={status} />

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <InfoCard icon={UserRound} label="Khách hàng" value={customerName} />
            <InfoCard icon={Phone} label="Số điện thoại" value={phone} />
            <InfoCard icon={MapPin} label="Địa chỉ giao hàng" value={address} wide />
          </div>

          <div className="mt-5 flex flex-col gap-5 rounded-2xl bg-stone-950 p-5 text-white sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-violet-200">
                <WalletCards className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-stone-400">Phương thức thanh toán</p>
                <p className="mt-1 font-bold">{result.payment?.name ?? result.paymentMethod ?? 'Chưa cập nhật'}</p>
              </div>
            </div>
            <div className="sm:text-right">
              <p className="text-xs text-stone-400">Tổng thanh toán</p>
              <p className="mt-1 text-2xl font-black text-amber-300 sm:text-3xl">{formatCurrency(total || 0)}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleDetails}
            disabled={loadingDetails}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 px-5 py-3 text-sm font-bold text-stone-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-60"
          >
            {loadingDetails ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
            {loadingDetails ? 'Đang tải sản phẩm' : showProducts ? 'Ẩn chi tiết sản phẩm' : 'Xem chi tiết sản phẩm'}
            {!loadingDetails && (showProducts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
          </button>
        </div>
      </section>

      {showProducts && <ProductDetails details={orderDetails} />}
    </div>
  );
}

function OrderTimeline({ status }) {
  if (status === 'CANCELLED') {
    return (
      <div className="mt-7 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
        <CircleX className="h-5 w-5 flex-shrink-0" />
        Đơn hàng này đã được hủy.
      </div>
    );
  }

  const currentStep = STATUS_STEPS.findIndex((step) => step.statuses.includes(status));

  return (
    <div className="mt-8 grid grid-cols-4">
      {STATUS_STEPS.map((step, index) => {
        const Icon = step.icon;
        const completed = index <= currentStep;
        return (
          <div key={step.label} className="relative flex flex-col items-center text-center">
            {index > 0 && (
              <span className={`absolute right-1/2 top-5 h-0.5 w-full ${index <= currentStep ? 'bg-violet-600' : 'bg-stone-200'}`} />
            )}
            <span className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white ${completed ? 'bg-violet-600 text-white' : 'bg-stone-100 text-stone-400'}`}>
              {index < currentStep ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </span>
            <span className={`mt-2 text-[10px] font-bold sm:text-xs ${completed ? 'text-stone-900' : 'text-stone-400'}`}>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, wide }) {
  return (
    <div className={`flex gap-3 rounded-2xl bg-stone-50 p-4 ${wide ? 'sm:col-span-2' : ''}`}>
      <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-violet-600" />
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-stone-400">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold leading-6 text-stone-800">{value || 'Chưa cập nhật'}</p>
      </div>
    </div>
  );
}

function ProductDetails({ details }) {
  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">Chi tiết đơn hàng</p>
          <h3 className="mt-2 text-xl font-black text-stone-900">Sản phẩm đã đặt</h3>
        </div>
        <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-600">{details.length} sản phẩm</span>
      </div>

      {details.length > 0 ? (
        <div className="mt-6 divide-y divide-stone-100">
          {details.map((detail) => {
            const product = detail.product_variant?.product;
            return (
              <article key={detail.id} className="grid gap-4 py-5 first:pt-0 last:pb-0 sm:grid-cols-[88px_minmax(0,1fr)_auto] sm:items-center">
                <img
                  src={getProductImage(detail)}
                  alt={product?.name || 'Sản phẩm'}
                  className="h-24 w-24 rounded-2xl bg-stone-100 object-cover sm:h-20 sm:w-20"
                  onError={(event) => { event.currentTarget.src = '/placeholder.jpg'; }}
                />
                <div className="min-w-0">
                  <h4 className="line-clamp-2 font-black text-stone-900">{product?.name || 'Sản phẩm'}</h4>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-stone-500">
                    <span className="rounded-full bg-stone-100 px-3 py-1">Màu: {detail.product_variant?.color?.name || 'N/A'}</span>
                    <span className="rounded-full bg-stone-100 px-3 py-1">Size: {detail.product_variant?.size?.name || 'N/A'}</span>
                    <span className="rounded-full bg-stone-100 px-3 py-1">Số lượng: {detail.quantity}</span>
                  </div>
                </div>
                <div className="sm:text-right">
                  <p className="text-xs text-stone-400">{formatCurrency(detail.price)} / sản phẩm</p>
                  <p className="mt-1 text-lg font-black text-violet-700">{formatCurrency(detail.total_money ?? detail.totalMoney)}</p>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl bg-stone-50 p-8 text-center text-sm text-stone-500">
          Chưa có thông tin chi tiết sản phẩm.
        </div>
      )}
    </section>
  );
}

function TrackingGuide() {
  return (
    <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-3">
      <GuideCard icon={ReceiptText} title="Chuẩn bị mã đơn" text="Mã đơn hàng có trong email hoặc lịch sử mua hàng." />
      <GuideCard icon={Phone} title="Nhập số điện thoại" text="Dùng đúng số điện thoại đã cung cấp khi đặt hàng." />
      <GuideCard icon={ShieldCheck} title="Thông tin bảo mật" text="Thông tin chỉ được dùng để xác minh và tra cứu đơn hàng." />
    </div>
  );
}

function GuideCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 font-black text-stone-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-500">{text}</p>
    </div>
  );
}
