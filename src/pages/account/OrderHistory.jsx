import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  LoaderCircle,
  PackageSearch,
  ShoppingBag,
  Truck,
  XCircle,
} from 'lucide-react';
import { getUserOrders } from '../../services/orderService';
import { cancelOrder } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import OrderItem from './OrderItem';
import { toast } from 'sonner';

const FILTERS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ xác nhận' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'SHIPPING', label: 'Đang giao' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

function normalizeStatus(status) {
  if (status === 'SHIPPED') return 'SHIPPING';
  if (status === 'DELIVERED') return 'COMPLETED';
  return status;
}

export default function OrderHistory({ onViewOrderDetail, onViewInvoice }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  const fetchOrders = async () => {
    if (!user?.id) {
      setLoadingOrders(false);
      return;
    }

    try {
      setLoadingOrders(true);
      const data = await getUserOrders(user.id);
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Không thể tải lịch sử đơn hàng:', error);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.id]);

  const handleCancelOrder = async (order) => {
    if (order.status !== 'PENDING' || cancellingOrderId) return;

    try {
      setCancellingOrderId(order.id);
      await cancelOrder(order.id);
      toast.success('Hủy đơn hàng thành công');
      setCancelTarget(null);
      await fetchOrders();
    } catch (error) {
      toast.error(error?.message || 'Không thể hủy đơn hàng');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const counts = useMemo(() => {
    return orders.reduce(
      (result, order) => {
        const status = normalizeStatus(order.status);
        result.ALL += 1;
        if (status in result) result[status] += 1;
        return result;
      },
      { ALL: 0, PENDING: 0, CONFIRMED: 0, SHIPPING: 0, COMPLETED: 0, CANCELLED: 0 },
    );
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const sorted = [...orders].sort((a, b) => {
      const dateA = new Date(a.order_date ?? a.orderDate ?? a.createdAt ?? 0);
      const dateB = new Date(b.order_date ?? b.orderDate ?? b.createdAt ?? 0);
      return dateB - dateA;
    });

    if (activeFilter === 'ALL') return sorted;
    return sorted.filter((order) => normalizeStatus(order.status) === activeFilter);
  }, [activeFilter, orders]);

  if (loadingOrders) {
    return (
      <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-100 bg-gradient-to-r from-stone-950 to-stone-800 p-7">
          <div className="h-7 w-52 animate-pulse rounded-lg bg-white/20" />
          <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-white/10" />
        </div>
        <div className="space-y-4 p-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-48 animate-pulse rounded-3xl bg-stone-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-stone-950 via-stone-900 to-violet-950 text-white shadow-xl">
        <div className="relative p-6 sm:p-8">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80">
                <ShoppingBag className="h-3.5 w-3.5" />
                NovaWear Orders
              </span>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Lịch sử mua hàng</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">
                Theo dõi trạng thái, xem chi tiết sản phẩm, đánh giá và tải hóa đơn của bạn.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <SummaryCard icon={Clock3} label="Đang xử lý" value={counts.PENDING + counts.CONFIRMED} />
              <SummaryCard icon={Truck} label="Đang giao" value={counts.SHIPPING} />
              <SummaryCard icon={CheckCircle2} label="Hoàn thành" value={counts.COMPLETED} />
            </div>
          </div>
        </div>
      </section>

      {orders.length > 0 ? (
        <>
          <div className="flex gap-2 overflow-x-auto rounded-2xl border border-stone-200 bg-white p-2 shadow-sm">
            {FILTERS.map((filter) => {
              const active = activeFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  className={`flex flex-shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    active
                      ? 'bg-stone-900 text-white shadow'
                      : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  {filter.label}
                  <span className={`rounded-full px-2 py-0.5 text-xs ${active ? 'bg-white/15' : 'bg-stone-100'}`}>
                    {counts[filter.value]}
                  </span>
                </button>
              );
            })}
          </div>

          {filteredOrders.length > 0 ? (
            <div className="space-y-5">
              {filteredOrders.map((order) => (
                <OrderItem
                  key={order.id}
                  order={order}
                  onViewDetail={onViewOrderDetail}
                  onViewInvoice={onViewInvoice}
                  onCancel={setCancelTarget}
                  cancelling={cancellingOrderId === order.id}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={activeFilter === 'CANCELLED' ? XCircle : PackageSearch}
              title="Không có đơn hàng phù hợp"
              description="Bạn chưa có đơn hàng nào ở trạng thái này."
            />
          )}
        </>
      ) : (
        <EmptyState
          icon={ShoppingBag}
          title="Chưa có đơn hàng"
          description="Các đơn hàng sẽ xuất hiện tại đây sau khi bạn hoàn tất mua sắm."
        />
      )}

      {cancelTarget && (
        <CancelOrderModal
          order={cancelTarget}
          loading={cancellingOrderId === cancelTarget.id}
          onClose={() => setCancelTarget(null)}
          onConfirm={() => handleCancelOrder(cancelTarget)}
        />
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="min-w-[88px] rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur sm:min-w-[112px] sm:p-4">
      <Icon className="h-4 w-4 text-violet-300" />
      <p className="mt-3 text-2xl font-black">{value}</p>
      <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-white/50 sm:text-xs">{label}</p>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100">
        <Icon className="h-8 w-8 text-stone-400" />
      </div>
      <h3 className="mt-5 text-xl font-bold text-stone-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">{description}</p>
    </div>
  );
}

function CancelOrderModal({ order, loading, onClose, onConfirm }) {
  const orderCode = order.order_code ?? order.orderCode ?? `#${order.id}`;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
          <XCircle className="h-7 w-7 text-red-600" />
        </div>
        <h3 className="mt-5 text-center text-xl font-bold text-stone-900">Xác nhận hủy đơn hàng</h3>
        <p className="mt-2 text-center text-sm leading-6 text-stone-500">
          Bạn có chắc muốn hủy đơn <span className="font-mono font-semibold text-stone-800">{orderCode}</span>?
          Thao tác này không thể hoàn tác.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-stone-200 px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50"
          >
            Giữ đơn
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {loading ? 'Đang hủy...' : 'Xác nhận hủy'}
          </button>
        </div>
      </div>
    </div>
  );
}
