import { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Users, ShoppingCart,
  DollarSign, Package, ArrowRight, Clock, CheckCircle,
  XCircle, AlertCircle, Truck
} from 'lucide-react';
import { getDashboardOverview, getOrderStatus, getRecentOrders } from '../../services/adminService';
import { formatCurrency } from '../../utils/format';

/* ───────── mock fallback ───────── */
const MOCK_OVERVIEW = {
  totalProducts: 3, totalOrders: 1, pendingOrders: 1, completedOrders: 0,
  totalUsers: 4, totalRevenue: 0, todayRevenue: 0, monthRevenue: 0,
};
const MOCK_STATUS  = { pending: 1, confirmed: 0, shipping: 0, completed: 0, cancelled: 0 };
const MOCK_ORDERS  = [
  { id: 1, customerName: 'Nguyễn Huỳnh Quang Vương', totalMoney: 987000, status: 'PENDING', createdAt: '2026-04-12T12:38:54' },
];

/* ───────── order status config ───────── */
const STATUS_CFG = {
  PENDING:    { label: 'Chờ xử lý',   color: 'text-amber-700 bg-amber-50 border-amber-200',   dot: 'bg-amber-500'   },
  CONFIRMED:  { label: 'Đã xác nhận', color: 'text-blue-700 bg-blue-50 border-blue-200',       dot: 'bg-blue-500'    },
  SHIPPING:   { label: 'Đang giao',   color: 'text-violet-700 bg-violet-50 border-violet-200', dot: 'bg-violet-500'  },
  COMPLETED:  { label: 'Đã giao',     color: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  CANCELLED:  { label: 'Đã huỷ',     color: 'text-red-700 bg-red-50 border-red-200',           dot: 'bg-red-500'     },
};

/* ───────── components ───────── */
function StatCard({ title, value, sub, icon: Icon, trend, trendValue, gradient }) {
  const up = trend === 'up';
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${gradient}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${up ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
          {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trendValue}
        </span>
      </div>
      <p className="text-2xl font-black text-slate-900 mb-0.5">{value}</p>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

function ProgressBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-slate-600 font-medium">{label}</span>
        <span className="text-sm font-bold text-slate-900">{value}</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ───────── page ───────── */
export default function AdminDashboard() {
  const [overview, setOverview]         = useState(null);
  const [orderStatus, setOrderStatus]   = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [ov, os, ro] = await Promise.all([
          getDashboardOverview(),
          getOrderStatus(),
          getRecentOrders(5),
        ]);
        setOverview(ov);
        setOrderStatus(os);
        setRecentOrders(ro);
      } catch (err) {
        console.warn('Dashboard API failed, using mock data:', err.message);
        setError(err.message);
        setOverview(MOCK_OVERVIEW);
        setOrderStatus(MOCK_STATUS);
        setRecentOrders(MOCK_ORDERS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[...new Array(4)].map((_, i) => (
            <div key={`skeleton-${i}`} className="bg-white rounded-2xl p-6 h-36 border border-slate-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 bg-white rounded-2xl h-64 border border-slate-200" />
          <div className="bg-white rounded-2xl h-64 border border-slate-200" />
        </div>
        <div className="bg-white rounded-2xl h-64 border border-slate-200" />
      </div>
    );
  }

  const totalStatusOrders =
    (orderStatus?.pending ?? 0) +
    (orderStatus?.confirmed ?? 0) +
    (orderStatus?.shipping ?? 0) +
    (orderStatus?.completed ?? 0) +
    (orderStatus?.cancelled ?? 0);

  const statCards = [
    {
      title: 'Tổng sản phẩm',  value: (overview?.totalProducts ?? 0).toLocaleString(),
      sub: 'Trong kho',        icon: Package,
      trend: 'up', trendValue: '—', gradient: 'bg-gradient-to-br from-blue-400 to-blue-600',
    },
    {
      title: 'Tổng đơn hàng',  value: (overview?.totalOrders ?? 0).toLocaleString(),
      sub: `${overview?.pendingOrders ?? 0} chờ xử lý`, icon: ShoppingCart,
      trend: 'up', trendValue: '—', gradient: 'bg-gradient-to-br from-violet-400 to-violet-600',
    },
    {
      title: 'Người dùng',     value: (overview?.totalUsers ?? 0).toLocaleString(),
      sub: 'Đã đăng ký',      icon: Users,
      trend: 'up', trendValue: '—', gradient: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
    },
    {
      title: 'Doanh thu tháng', value: formatCurrency(overview?.monthRevenue ?? 0),
      sub: `Hôm nay: ${formatCurrency(overview?.todayRevenue ?? 0)}`, icon: DollarSign,
      trend: (overview?.monthRevenue ?? 0) >= 0 ? 'up' : 'down', trendValue: '—',
      gradient: 'bg-gradient-to-br from-amber-400 to-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        {error && (
          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
            Đang dùng dữ liệu mẫu — API chưa kết nối
          </span>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card) => <StatCard key={card.title} {...card} />)}
      </div>

      {/* Revenue summary + Order status */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Revenue summary */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
          <h2 className="text-base font-bold text-slate-900 mb-6">Tổng quan doanh thu</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Doanh thu hôm nay', value: formatCurrency(overview?.todayRevenue ?? 0), icon: TrendingUp,   color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { label: 'Doanh thu tháng',   value: formatCurrency(overview?.monthRevenue ?? 0),  icon: DollarSign,   color: 'text-blue-500',    bg: 'bg-blue-50'    },
              { label: 'Tổng doanh thu',    value: formatCurrency(overview?.totalRevenue ?? 0),  icon: Package,      color: 'text-violet-500',  bg: 'bg-violet-50'  },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`rounded-2xl p-5 ${bg}`}>
                <Icon className={`w-6 h-6 mb-3 ${color}`} />
                <p className="text-xl font-black text-slate-900">{value}</p>
                <p className="text-xs text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Completed vs Pending */}
          <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
              <CheckCircle className="w-8 h-8 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-xl font-black text-slate-900">{overview?.completedOrders ?? 0}</p>
                <p className="text-xs text-slate-500">Đơn hoàn thành</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
              <Clock className="w-8 h-8 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-xl font-black text-slate-900">{overview?.pendingOrders ?? 0}</p>
                <p className="text-xs text-slate-500">Đơn chờ xử lý</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order status breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
          <h2 className="text-base font-bold text-slate-900 mb-5">Trạng thái đơn hàng</h2>
          <div className="space-y-4">
            <ProgressBar label="Chờ xử lý"   value={orderStatus?.pending   ?? 0} max={totalStatusOrders} color="bg-amber-500"   />
            <ProgressBar label="Đã xác nhận" value={orderStatus?.confirmed ?? 0} max={totalStatusOrders} color="bg-blue-500"    />
            <ProgressBar label="Đang giao"   value={orderStatus?.shipping  ?? 0} max={totalStatusOrders} color="bg-violet-500"  />
            <ProgressBar label="Đã giao"     value={orderStatus?.completed ?? 0} max={totalStatusOrders} color="bg-emerald-500" />
            <ProgressBar label="Đã huỷ"      value={orderStatus?.cancelled ?? 0} max={totalStatusOrders} color="bg-red-500"     />
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm text-slate-500">Tổng đơn</span>
            <span className="text-lg font-black text-slate-900">{totalStatusOrders}</span>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Đơn hàng gần đây</h2>
          <button className="text-sm text-violet-600 font-semibold hover:text-violet-800 transition-colors flex items-center gap-1">
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingCart className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Chưa có đơn hàng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mã đơn</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Khách hàng</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Giá trị</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => {
                  const cfg = STATUS_CFG[order.status] ?? STATUS_CFG.PENDING;
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-mono font-semibold text-slate-700">#{order.id}</td>
                      <td className="px-6 py-4 text-slate-700 font-medium">{order.customerName}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{formatCurrency(order.totalMoney)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
