import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, X, Loader2, AlertTriangle, CheckCircle, Palette,
} from 'lucide-react';
import {
  getColors, createColor, updateColor, deleteColor,
  getSizes,  createSize,  updateSize,  deleteSize,
} from '../../services/adminService';

/* ─── shared ─── */
function Err({ msg }) {
  if (!msg) return null;
  return (
    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
      <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {msg}
    </div>
  );
}

function DeleteModal({ name, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const run = async () => {
    setLoading(true);
    try { await onConfirm(); onClose(); }
    catch (e) { alert(e.message); setLoading(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-center w-14 h-14 bg-red-100 rounded-2xl mx-auto mb-4">
          <Trash2 className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-base font-bold text-slate-900 text-center mb-1">Xác nhận xoá?</h3>
        <p className="text-sm text-slate-500 text-center mb-6">
          <span className="font-semibold text-slate-700">"{name}"</span> sẽ bị xoá vĩnh viễn.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Huỷ</button>
          <button onClick={run} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Xoá
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   COLORS SECTION
════════════════════════════════════════ */
function ColorModal({ initial, onClose, onSaved }) {
  const [name, setName]     = useState(initial?.name ?? '');
  const [code, setCode]     = useState(initial?.code ?? '#000000');
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');
  const isEdit = !!initial?.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setErr('Vui lòng nhập tên màu.'); return; }
    setSaving(true);
    try {
      const body = { name: name.trim(), code: code };
      if (isEdit) await updateColor(initial.id, body);
      else        await createColor(body);
      onSaved();
    } catch (error) {
      setErr(error.message ?? 'Có lỗi xảy ra.');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">{isEdit ? 'Sửa màu sắc' : 'Thêm màu sắc'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <Err msg={err} />
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên màu <span className="text-red-500">*</span></label>
            <input
              autoFocus value={name} onChange={e => setName(e.target.value)}
              placeholder="VD: Đỏ tươi"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mã màu (HEX)</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-12 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
              />
              <input
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="#000000"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm font-mono"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Huỷ</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...</> : <><CheckCircle className="w-4 h-4" /> {isEdit ? 'Cập nhật' : 'Thêm mới'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ColorsSection() {
  const [colors, setColors]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);
  const [delTarget, setDelTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getColors();
      setColors(data?.colorResponseList ?? data?.result ?? data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
            <Palette className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Màu sắc</h2>
            <p className="text-xs text-slate-400">{colors.length} màu</p>
          </div>
        </div>
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Thêm
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
            <span className="text-sm">Đang tải...</span>
          </div>
        ) : colors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Palette className="w-10 h-10 text-slate-200 mb-2" />
            <p className="text-slate-400 text-sm">Chưa có màu nào</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left border-b border-slate-100">
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-12">ID</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Màu</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mã HEX</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {colors.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3 text-slate-400 font-mono text-xs">{c.id}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-6 h-6 rounded-lg border border-slate-200 flex-shrink-0 shadow-sm"
                        style={{ background: c.code ?? '#e2e8f0' }}
                      />
                      <span className="font-semibold text-slate-800">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">{c.code ?? '—'}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => setModal({ id: c.id, name: c.name, code: c.code ?? '#000000' })}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors" title="Sửa"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDelTarget(c)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Xoá"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <ColorModal
          initial={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
      {delTarget && (
        <DeleteModal
          name={delTarget.name}
          onClose={() => setDelTarget(null)}
          onConfirm={() => deleteColor(delTarget.id).then(() => { setDelTarget(null); load(); })}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   SIZES SECTION
════════════════════════════════════════ */
function SizeModal({ initial, onClose, onSaved }) {
  const [name, setName]     = useState(initial?.name ?? '');
  const [sortOrder, setSortOrder] = useState(
    initial?.sort_order ?? initial?.sortOrder ?? ''
  );


  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');
  const isEdit = !!initial?.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setErr('Vui lòng nhập tên size.'); return; }

    const sortOrderNum = Number(sortOrder);
    if (!Number.isFinite(sortOrderNum)) { setErr('Vui lòng nhập sort_order hợp lệ.'); return; }

    setSaving(true);
    try {
      const payload = { name: name.trim(), sort_order: sortOrderNum };
      if (isEdit) await updateSize(initial.id, payload);
      else        await createSize(payload);
      onSaved();
    } catch (error) {
      setErr(error.message ?? 'Có lỗi xảy ra.');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">{isEdit ? 'Sửa kích thước' : 'Thêm kích thước'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <Err msg={err} />
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên kích thước <span className="text-red-500">*</span></label>
            <input
              autoFocus value={name} onChange={e => setName(e.target.value)}
              placeholder="VD: S, M, L, XL, 38, 39..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sort order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              placeholder="VD: 1"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm font-mono"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Huỷ</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...</> : <><CheckCircle className="w-4 h-4" /> {isEdit ? 'Cập nhật' : 'Thêm mới'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SizesSection() {
  const [sizes, setSizes]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);
  const [delTarget, setDelTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSizes();
      setSizes(data?.sizeResponseList ?? data?.result ?? data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center">
            <span className="text-white font-black text-xs">S/M</span>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Kích thước</h2>
            <p className="text-xs text-slate-400">{sizes.length} size</p>
          </div>
        </div>
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Thêm
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
            <span className="text-sm">Đang tải...</span>
          </div>
        ) : sizes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="text-4xl text-slate-200 font-black mb-2">S</span>
            <p className="text-slate-400 text-sm">Chưa có kích thước nào</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left border-b border-slate-100">
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-12">ID</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tên kích thước</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sizes.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3 text-slate-400 font-mono text-xs">{s.id}</td>
                  <td className="px-5 py-3">
                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-sm font-bold border border-slate-200">
                      {s.name}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => setModal({ id: s.id, name: s.name })}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors" title="Sửa"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDelTarget(s)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Xoá"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <SizeModal
          initial={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
      {delTarget && (
        <DeleteModal
          name={delTarget.name}
          onClose={() => setDelTarget(null)}
          onConfirm={() => deleteSize(delTarget.id).then(() => { setDelTarget(null); load(); })}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════ */
export default function AdminAttributes() {
  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Màu sắc & Kích thước</h1>
        <p className="text-sm text-slate-500 mt-0.5">Quản lý màu sắc và kích thước sản phẩm</p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <ColorsSection />
        <SizesSection />
      </div>
    </div>
  );
}
