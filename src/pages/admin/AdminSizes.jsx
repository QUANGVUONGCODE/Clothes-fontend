import { useState, useEffect, useCallback } from 'react';
import { Ruler, Plus, Trash2, Loader2, X } from 'lucide-react';
import { getSizes, createSize, deleteSize } from '../../services/adminService';

export default function AdminSizes() {
  const [sizes, setSizes]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName]         = useState('');
  const [saving, setSaving]     = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSizes();
      setSizes(Array.isArray(data) ? data : data?.sizes ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await createSize({ name: name.trim() });
      setShowForm(false);
      setName('');
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xoá kích cỡ này?')) return;
    setDeletingId(id);
    try {
      await deleteSize(id);
      setSizes(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Kích cỡ</h1>
          <p className="text-sm text-slate-500 mt-0.5">Quản lý danh sách kích cỡ sản phẩm</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl shadow transition-colors"
        >
          <Plus className="w-4 h-4" /> Thêm kích cỡ
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-slate-800 text-sm">Thêm kích cỡ mới</p>
            <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleAdd} className="flex items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Tên kích cỡ</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="VD: XL, 42, 28..."
                className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 w-48"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Lưu
            </button>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-violet-500" />
            <p className="text-sm text-slate-400">Đang tải...</p>
          </div>
        ) : sizes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Ruler className="w-12 h-12 text-slate-200" />
            <p className="text-slate-400 text-sm">Chưa có kích cỡ nào</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-12">ID</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tên kích cỡ</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sizes.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{s.id}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-sm">
                      {s.name}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleDelete(s.id)}
                      disabled={deletingId === s.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all disabled:opacity-50"
                    >
                      {deletingId === s.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />
                      }
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
