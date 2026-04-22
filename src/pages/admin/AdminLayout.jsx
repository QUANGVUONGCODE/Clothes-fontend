import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, LogOut,
  Bell, Search, Menu, Settings, BarChart3,
  List, Palette, ClipboardList, Clock, Truck,
  CheckCircle, XCircle, ChevronRight, Tag, Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  {
    to: '/admin/products', icon: Package, label: 'Sản phẩm',
    subItems: [
      { to: '/admin/products',   label: 'Danh sách SP', icon: List    },
      { to: '/admin/variants',   label: 'Biến thể SP',  icon: Layers  },
      { to: '/admin/attributes', label: 'Màu & Size',   icon: Palette },
    ],
  },
  {
    to: '/admin/orders', icon: ShoppingCart, label: 'Đơn hàng',
    subItems: [
      { to: '/admin/orders',                   label: 'Tất cả',       icon: ClipboardList },
      { to: '/admin/orders?status=PENDING',    label: 'Chờ xử lý',    icon: Clock         },
      { to: '/admin/orders?status=CONFIRMED',  label: 'Đã xác nhận',  icon: CheckCircle   },
      { to: '/admin/orders?status=SHIPPING',   label: 'Đang giao',    icon: Truck         },
      { to: '/admin/orders?status=COMPLETED',  label: 'Hoàn thành',   icon: CheckCircle   },
      { to: '/admin/orders?status=CANCELLED',  label: 'Đã huỷ',       icon: XCircle       },
    ],
  },
  { to: '/admin/users',       icon: Users,     label: 'Người dùng' },
  {
    to: '/admin/categories', icon: Tag, label: 'Danh mục',
    subItems: [
      { to: '/admin/categories',                         label: 'Danh mục lớn', icon: Tag      },
      { to: '/admin/categories?tab=categories',          label: 'Danh mục',     icon: Tag      },
      { to: '/admin/categories?tab=subcategories',       label: 'Danh mục con', icon: Tag      },
    ],
  },
  { to: '/admin/analytics', icon: BarChart3, label: 'Thống kê'   },
  { to: '/admin/settings',  icon: Settings,  label: 'Cài đặt'    },
];

function isItemActive(item, pathname, search) {
  if (pathname === item.to || pathname.startsWith(item.to + '/')) return true;
  return item.subItems?.some(s => pathname === s.to.split('?')[0]) ?? false;
}

function isSubActive(sub, pathname, search, activeItem) {
  if (sub.to.includes('?')) {
    const qIdx = sub.to.indexOf('?');
    return pathname === sub.to.slice(0, qIdx) && search === sub.to.slice(qIdx);
  }
  const hasSiblingWithQuery = activeItem?.subItems?.some(
    s => s.to.includes('?') && s.to.startsWith(sub.to + '?')
  );
  if (hasSiblingWithQuery) return pathname === sub.to && !search;
  return pathname === sub.to || pathname.startsWith(sub.to + '/');
}

export default function AdminLayout({ children }) {
  const { user, signOut } = useAuth();
  const navigate          = useNavigate();
  const location          = useLocation();
  const [hidden, setHidden]       = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { signOut(); navigate('/login'); };

  const activeItem = NAV_ITEMS.find(item =>
    isItemActive(item, location.pathname, location.search)
  ) ?? null;

  const hasSubNav = !hidden && !!activeItem?.subItems;

  const primarySidebar = (iconOnly) => (
    <aside className={`flex flex-col h-full bg-slate-900 text-white transition-all duration-300 flex-shrink-0 ${iconOnly ? 'w-16' : 'w-64'}`}>
      {/* Logo */}
      <div className={`flex items-center gap-3 py-6 border-b border-slate-700/60 ${iconOnly ? 'justify-center' : 'px-5'}`}>
        <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
          <span className="text-white font-black text-sm">N</span>
        </div>
        {!iconOnly && (
          <div>
            <p className="font-black text-white text-base leading-tight">NovaAdmin</p>
            <p className="text-slate-400 text-xs">v2.0</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 space-y-1 overflow-y-auto px-2">
        {NAV_ITEMS.map((item) => {
          const active = isItemActive(item, location.pathname, location.search);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              title={iconOnly ? item.label : undefined}
              className={`
                flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${iconOnly ? 'justify-center w-10 mx-auto px-0' : 'px-3'}
                ${active
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
              {!iconOnly && <span>{item.label}</span>}
              {!iconOnly && item.subItems && active && (
                <ChevronRight className="w-4 h-4 ml-auto opacity-70" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-slate-700/60 p-3 space-y-1">
        {!iconOnly && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/60 mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {(user?.full_name || user?.name || 'A')[0].toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.full_name || user?.name || 'Admin'}</p>
              <p className="text-slate-400 text-xs">Administrator</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title={iconOnly ? 'Đăng xuất' : undefined}
          className={`w-full flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all ${iconOnly ? 'justify-center w-10 mx-auto px-0' : 'px-3'}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!iconOnly && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );

  const subNavPanel = () => (
    <aside className="flex flex-col h-full w-52 bg-slate-800 border-r border-slate-700/40 flex-shrink-0">
      <div className="px-4 pt-6 pb-4 border-b border-slate-700/40">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeItem.label}</p>
      </div>
      <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
        {activeItem.subItems.map((sub) => {
          const active = isSubActive(sub, location.pathname, location.search, activeItem);
          const SubIcon = sub.icon;
          return (
            <Link
              key={sub.to}
              to={sub.to}
              className={`
                flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group
                ${active
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'text-slate-400 hover:bg-slate-700/60 hover:text-slate-200'}
              `}
            >
              <SubIcon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span>{sub.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Desktop sidebar */}
      {!hidden && (
        <div className="hidden lg:flex h-full">
          {primarySidebar(hasSubNav)}
          {hasSubNav && subNavPanel()}
        </div>
      )}

      {/* Mobile overlay */}
{mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-10 flex">
          <div className="flex h-full">
            {primarySidebar(false)}
          </div>
          <button
            type="button"
            aria-label="Đóng menu"
            className="flex-1 bg-black/50 cursor-default pointer-events-auto"
            onClick={() => setMobileOpen(false)}
            onKeyDown={(e) => e.key === 'Escape' && setMobileOpen(false)}
          />
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center gap-4 px-6 py-4 bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
          <button
            onClick={() => { setHidden(p => !p); setMobileOpen(p => !p); }}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center cursor-pointer shadow">
              <span className="text-white text-sm font-bold">
                {(user?.full_name || user?.name || 'A')[0].toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
