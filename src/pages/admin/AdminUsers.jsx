import { useState, useEffect, useCallback } from 'react';
import {
  Search, ChevronLeft, ChevronRight, Users,
  Loader2, ShieldCheck, ShieldOff, UserCircle
} from 'lucide-react';
import { getAllUsers, toggleUserActive } from '../../services/adminService';
import { formatDate } from '../../utils/format';

const ROLE_CFG = {
  ROLE_ADMIN: { label: 'Admin',       color: 'text-violet-700 bg-violet-50 border-violet-200' },
  ROLE_USER:  { label: 'Người dùng',  color: 'text-blue-700 bg-blue-50 border-blue-200'       },
};

function RoleBadge({ role }) {
  const cfg = ROLE_CFG[role] ?? ROLE_CFG.ROLE_USER;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function Avatar({ name }) {
  const initials = (name ?? '?').slice(0, 2).toUpperCase();
  const colors = [
    'from-violet-400 to-indigo-500',
    'from-blue-400 to-cyan-500',
    'from-emerald-400 to-teal-500',
    'from-amber-400 to-orange-500',
    'from-pink-400 to-rose-500',
  ];
  const color = colors[(name ?? '').charCodeAt(0) % colors.length];
  return (
    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
      <span className="text-white text-xs font-bold">{initials}</span>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [page, setPage]       = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [toggling, setToggling] = useState(null);
  const LIMIT = 10;

  const load = useCallback(async (kw = keyword, p = page) => {
    setLoading(true);
    try {
      const data = await getAllUsers(p, LIMIT, kw);
      const list = data?.userResponseList ?? data?.users ?? data ?? [];
      setUsers(list);
      setHasMore(list.length === LIMIT);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [keyword, page]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => {
    const kw = e.target.value;
    setKeyword(kw);
    setPage(0);
    load(kw, 0);
  };

  const handleToggle = async (user) => {
    setToggling(user.id);
    try {
      await toggleUserActive(user.id, !user.is_active);
      setUsers(prev =>
        prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u)
      );
    } catch (e) {
      alert(e.message);
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Người dùng</h1>
        <p className="text-sm text-slate-500 mt-0.5">Quản lý tài khoản người dùng trong hệ thống</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 shadow-sm">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={keyword}
            onChange={handleSearch}
            placeholder="Tìm theo tên, số điện thoại..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            <p className="text-sm text-slate-400">Đang tải người dùng...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Users className="w-12 h-12 text-slate-200" />
            <p className="text-slate-400 text-sm">Không tìm thấy người dùng</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left border-b border-slate-100">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-12">ID</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Người dùng</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Số điện thoại</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vai trò</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày tạo</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => {
                  const name    = user.full_name ?? user.name ?? user.phone_number ?? '?';
                  const role    = user.role ?? user.role_name ?? 'ROLE_USER';
                  const active  = user.is_active ?? true;
                  const isToggling = toggling === user.id;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{user.id}</td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={name} />
                          <div>
                            <p className="font-semibold text-slate-800">{name}</p>
                            {user.full_name && user.name && user.full_name !== user.name && (
                              <p className="text-xs text-slate-400">@{user.name}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-slate-600 font-mono text-xs">
                        {user.phone_number ?? '—'}
                      </td>

                      <td className="px-5 py-3.5 text-slate-600 text-xs">
                        {user.email ?? '—'}
                      </td>

                      <td className="px-5 py-3.5">
                        <RoleBadge role={role} />
                      </td>

                      <td className="px-5 py-3.5 text-slate-500 text-xs">
                        {user.created_at ? formatDate(user.created_at) : '—'}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleToggle(user)}
                          disabled={isToggling || role === 'ROLE_ADMIN'}
                          title={role === 'ROLE_ADMIN' ? 'Không thể khoá admin' : active ? 'Khoá tài khoản' : 'Mở khoá tài khoản'}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            active
                              ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                              : 'text-red-600 bg-red-50 hover:bg-red-100 border border-red-200'
                          }`}
                        >
                          {isToggling
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : active
                              ? <ShieldCheck className="w-3.5 h-3.5" />
                              : <ShieldOff className="w-3.5 h-3.5" />
                          }
                          {active ? 'Đang hoạt động' : 'Đã khoá'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && users.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100">
            <p className="text-sm text-slate-500">Trang <span className="font-semibold text-slate-700">{page + 1}</span></p>
            <div className="flex items-center gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4" /> Trước
              </button>
              <button disabled={!hasMore} onClick={() => setPage(p => p + 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Sau <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
