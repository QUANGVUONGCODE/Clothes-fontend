import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus, Pencil, Trash2, X, Loader2, AlertTriangle, CheckCircle,
  FolderOpen, ChevronDown, Camera,
} from 'lucide-react';
import { getProductImageUrl } from '../../services/subCategoryService';
import {
  getAllDepartments, createDepartment, updateDepartment, deleteDepartment,
  getCatsByDept,    createCategory,    updateCategory,    deleteCategory,
  getSubCatsByCat,  createSubCategory, updateSubCategory, deleteSubCategory,
  uploadSubCategoryImages,
} from '../../services/adminService';


/* ─── shared tiny components ─── */
function Err({ msg }) {
  if (!msg) return null;
  return (
    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
      <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {msg}
    </div>
  );
}

function EmptyRow({ cols, icon: Icon, label }) {
  return (
    <tr>
      <td colSpan={cols} className="py-16 text-center">
        <Icon className="w-10 h-10 text-slate-200 mx-auto mb-2" />
        <p className="text-slate-400 text-sm">{label}</p>
      </td>
    </tr>
  );
}

/* ─── generic delete confirm modal ─── */
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
   TAB 1 – DEPARTMENTS
════════════════════════════════════════ */
function DeptModal({ initial, onClose, onSaved }) {
  const [name, setName]     = useState(initial?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');
  const isEdit = !!initial?.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setErr('Vui lòng nhập tên danh mục lớn.'); return; }
    setSaving(true);
    try {
      if (isEdit) await updateDepartment(initial.id, { name: name.trim() });
      else        await createDepartment({ name: name.trim() });
      onSaved();
    } catch (error) {
      setErr(error.message ?? 'Có lỗi xảy ra.');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">{isEdit ? 'Sửa danh mục lớn' : 'Thêm danh mục lớn'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <Err msg={err} />
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên danh mục lớn <span className="text-red-500">*</span></label>
            <input
              autoFocus value={name} onChange={e => setName(e.target.value)}
              placeholder="VD: Thời trang nam"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
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

function DepartmentsTab() {
  const [depts, setDepts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null); // null | 'add' | {id, name}
  const [delTarget, setDelTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllDepartments();
      setDepts(data?.result ?? data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Quản lý tất cả danh mục lớn</p>
        <button onClick={() => setModal('add')} className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-violet-300">
          <Plus className="w-4 h-4" /> Thêm danh mục lớn
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
            <span className="text-sm">Đang tải...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left border-b border-slate-100">
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">ID</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tên danh mục lớn</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {depts.length === 0
                  ? <EmptyRow cols={3} icon={FolderOpen} label="Chưa có danh mục lớn nào" />
                  : depts.map(d => (
                    <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-3.5 text-slate-400 font-mono text-xs">{d.id}</td>
                      <td className="px-6 py-3.5 font-semibold text-slate-800">{d.name}</td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button onClick={() => setModal(d)} className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors" title="Sửa">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDelTarget(d)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Xoá">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <DeptModal
          initial={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
      {delTarget && (
        <DeleteModal
          name={delTarget.name}
          onClose={() => setDelTarget(null)}
          onConfirm={() => deleteDepartment(delTarget.id).then(() => { setDelTarget(null); load(); })}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   TAB 2 – CATEGORIES
════════════════════════════════════════ */
function CatModal({ initial, depts, onClose, onSaved }) {
  const [name, setName]       = useState(initial?.name ?? '');
  const [deptId, setDeptId]   = useState(initial?.deptId ?? '');
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState('');
  const isEdit = !!initial?.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !deptId) { setErr('Vui lòng điền đầy đủ thông tin.'); return; }
    setSaving(true);
    try {
      const body = { name: name.trim(), department_id: Number(deptId) };
      if (isEdit) await updateCategory(initial.id, body);
      else        await createCategory(body);
      onSaved();
    } catch (error) {
      setErr(error.message ?? 'Có lỗi xảy ra.');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">{isEdit ? 'Sửa danh mục' : 'Thêm danh mục'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <Err msg={err} />
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên danh mục <span className="text-red-500">*</span></label>
            <input
              autoFocus value={name} onChange={e => setName(e.target.value)}
              placeholder="VD: Áo thun"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Danh mục lớn <span className="text-red-500">*</span></label>
            <div className="relative">
              <select
                value={deptId} onChange={e => setDeptId(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm bg-white pr-10"
              >
                <option value="">Chọn danh mục lớn...</option>
                {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
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

function CategoriesTab() {
  const [depts, setDepts]         = useState([]);
  const [selDept, setSelDept]     = useState('');
  const [cats, setCats]           = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [loadingCats, setLoadingCats]   = useState(false);
  const [modal, setModal]         = useState(null);
  const [delTarget, setDelTarget] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllDepartments();
        const list = data?.result ?? data ?? [];
        setDepts(list);
        if (list.length > 0) setSelDept(String(list[0].id));
      } catch (e) { console.error(e); }
      finally { setLoadingDepts(false); }
    })();
  }, []);

  const loadCats = useCallback(async (deptId) => {
    if (!deptId) { setCats([]); return; }
    setLoadingCats(true);
    try {
      const data = await getCatsByDept(Number(deptId));
      setCats(data?.result ?? data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoadingCats(false); }
  }, []);

  useEffect(() => { loadCats(selDept); }, [selDept, loadCats]);

  const selDeptName = depts.find(d => String(d.id) === selDept)?.name ?? '';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Department selector */}
        <div className="relative w-64">
          {loadingDepts ? (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" /> Đang tải...
            </div>
          ) : (
            <>
              <select
                value={selDept} onChange={e => setSelDept(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm bg-white pr-10 font-medium text-slate-700"
              >
                {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </>
          )}
        </div>
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-violet-300"
        >
          <Plus className="w-4 h-4" /> Thêm danh mục
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loadingCats ? (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
            <span className="text-sm">Đang tải...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left border-b border-slate-100">
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">ID</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tên danh mục</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Danh mục lớn</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cats.length === 0
                  ? <EmptyRow cols={4} icon={FolderOpen} label="Chưa có danh mục nào trong nhóm này" />
                  : cats.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-3.5 text-slate-400 font-mono text-xs">{c.id}</td>
                      <td className="px-6 py-3.5 font-semibold text-slate-800">{c.name}</td>
                      <td className="px-6 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                          {c.department?.name ?? c.departments?.name ?? selDeptName}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => setModal({ id: c.id, name: c.name, deptId: c.department?.id ?? c.departments?.id ?? selDept })}
                            className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors" title="Sửa"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDelTarget(c)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Xoá">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <CatModal
          initial={modal === 'add' ? null : modal}
          depts={depts}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); loadCats(selDept); }}
        />
      )}
      {delTarget && (
        <DeleteModal
          name={delTarget.name}
          onClose={() => setDelTarget(null)}
          onConfirm={() => deleteCategory(delTarget.id).then(() => { setDelTarget(null); loadCats(selDept); })}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   TAB 3 – SUB-CATEGORIES
════════════════════════════════════════ */
function SubCatModal({ initial, cats, onClose, onSaved }) {
  const [name, setName]     = useState(initial?.name ?? '');
  const [catId, setCatId]   = useState(initial?.catId ?? initial?.category_id ?? '');


  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');
  const isEdit = !!initial?.id;



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !catId) {
      setErr('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    setSaving(true);
    try {
      const baseBody = {
        name: name.trim(),
        category_id: Number(catId),
      };

      if (isEdit) {
        await updateSubCategory(initial.id, baseBody);
      } else {
        await createSubCategory(baseBody);
      }

      // Upload thumbnail đã tách sang API khác (sub-category-images/upload),
      // hiện tại chỉ xử lý CRUD sub-category.
      onSaved();
    } catch (error) {
      setErr(error.message ?? 'Có lỗi xảy ra.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">{isEdit ? 'Sửa danh mục con' : 'Thêm danh mục con'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <Err msg={err} />

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên danh mục con <span className="text-red-500">*</span></label>
            <input
              autoFocus value={name} onChange={e => setName(e.target.value)}
              placeholder="VD: Áo thun cổ tròn"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Danh mục <span className="text-red-500">*</span></label>
            <div className="relative">
              <select
                value={catId} onChange={e => setCatId(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm bg-white pr-10"
              >
                <option value="">Chọn danh mục...</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
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

function UploadThumbButton({ subCategoryId, onUploaded }) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handlePick = (e) => {
    const list = Array.from(e.target.files || []);
    setFiles(list);
    setError('');
  };

  const handleUpload = async () => {
    if (!subCategoryId) return;
    if (files.length === 0) {
      setError('Chọn ít nhất 1 ảnh.');
      return;
    }

    setUploading(true);
    setError('');
    try {
      // Upload API riêng: /sub-categories/sub-category-images/upload?subCategoryId=...
      await uploadSubCategoryImages(Number(subCategoryId), files);
      setOpen(false);
      setFiles([]);
      if (onUploaded) onUploaded();
    } catch (e) {
      setError(e?.message ?? 'Upload ảnh thất bại.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
        title="Thêm ảnh"
      >
        <Camera className="w-4 h-4" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Upload ảnh</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
              )}

              <div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePick}
                  className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border file:border-slate-200 file:bg-white file:text-sm file:font-semibold hover:file:bg-slate-50"
                />
                <p className="mt-2 text-xs text-slate-500">Chọn ảnh để upload thumbnail cho danh mục con.</p>
              </div>

              {files.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {files.map((f, idx) => (
                    <img
                      key={idx}
                      src={URL.createObjectURL(f)}
                      alt={`preview-${idx}`}
                      className="w-full h-20 object-cover rounded-lg border border-slate-200 bg-white"
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Huỷ
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                  {uploading ? 'Đang upload...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SubCategoriesTab() {

  const [depts, setDepts]         = useState([]);

  const [selDept, setSelDept]     = useState('');
  const [cats, setCats]           = useState([]);
  const [selCat, setSelCat]       = useState('');
  const [subs, setSubs]           = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [loadingCats, setLoadingCats]   = useState(false);
  const [loadingSubs, setLoadingSubs]   = useState(false);
  const [modal, setModal]         = useState(null);
  const [delTarget, setDelTarget] = useState(null);

  /* load departments once */
  useEffect(() => {
    (async () => {
      try {
        const data = await getAllDepartments();
        const list = data?.result ?? data ?? [];
        setDepts(list);
        if (list.length > 0) setSelDept(String(list[0].id));
      } catch (e) { console.error(e); }
      finally { setLoadingDepts(false); }
    })();
  }, []);

  /* load categories when dept changes */
  useEffect(() => {
    if (!selDept) { setCats([]); setSelCat(''); return; }
    setLoadingCats(true);
    getCatsByDept(Number(selDept))
      .then(data => {
        const list = data?.result ?? data ?? [];
        setCats(list);
        setSelCat(list.length > 0 ? String(list[0].id) : '');
      })
      .catch(console.error)
      .finally(() => setLoadingCats(false));
  }, [selDept]);

  /* load subcategories when category changes */
  const loadSubs = useCallback(async (catId) => {
    if (!catId) { setSubs([]); return; }
    setLoadingSubs(true);
    try {
      const data = await getSubCatsByCat(Number(catId));
      setSubs(data?.result ?? data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoadingSubs(false); }
  }, []);

  useEffect(() => { loadSubs(selCat); }, [selCat, loadSubs]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Department filter */}
          <div className="relative">
            {loadingDepts ? (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-400 w-48">
                <Loader2 className="w-4 h-4 animate-spin" /> Đang tải...
              </div>
            ) : (
              <>
                <select
                  value={selDept} onChange={e => setSelDept(e.target.value)}
                  className="appearance-none px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm bg-white pr-10 font-medium text-slate-700 w-48"
                >
                  {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </>
            )}
          </div>

          {/* Category filter */}
          <div className="relative">
            {loadingCats ? (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-400 w-44">
                <Loader2 className="w-4 h-4 animate-spin" /> Đang tải...
              </div>
            ) : (
              <>
                <select
                  value={selCat} onChange={e => setSelCat(e.target.value)}
                  className="appearance-none px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm bg-white pr-10 font-medium text-slate-700 w-44"
                  disabled={cats.length === 0}
                >
                  {cats.length === 0
                    ? <option value="">Không có danh mục</option>
                    : cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                  }
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </>
            )}
          </div>
        </div>

        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-violet-300"
        >
          <Plus className="w-4 h-4" /> Thêm danh mục con
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loadingSubs ? (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
            <span className="text-sm">Đang tải...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left border-b border-slate-100">
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">ID</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tên danh mục con</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Danh mục</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Danh mục lớn</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subs.length === 0 ? (
                  <EmptyRow cols={5} icon={FolderOpen} label="Chưa có danh mục con nào" />
                ) : (
                  subs.map((s) => {
                    const thumbUrl = getProductImageUrl(s.thumbnail ?? s?.image ?? null);
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-3.5 text-slate-400 font-mono text-xs">{s.id}</td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            {thumbUrl ? (
                              <img
                                src={thumbUrl}
                                alt={s.name}
                                className="w-8 h-8 rounded-lg object-cover border border-slate-200 bg-white flex-shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-400 text-[10px] flex items-center justify-center flex-shrink-0">—</div>
                            )}
                            <span className="font-semibold text-slate-800">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            {s.category?.name ?? cats.find((c) => String(c.id) === selCat)?.name ?? '—'}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-slate-500 text-xs">
                          {s.category?.department?.name ?? depts.find((d) => String(d.id) === selDept)?.name ?? '—'}
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-1.5 justify-end">
                            <button
                              onClick={() => setModal({ id: s.id, name: s.name, catId: s.category?.id ?? selCat })}
                              className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors" title="Sửa"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            <UploadThumbButton subCategoryId={s.id} onUploaded={() => loadSubs(selCat)} />

                            <button
                              onClick={() => setDelTarget(s)}
                              className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                              title="Xoá"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <SubCatModal
          initial={modal === 'add' ? null : modal}
          cats={cats}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); loadSubs(selCat); }}
        />
      )}
      {delTarget && (
        <DeleteModal
          name={delTarget.name}
          onClose={() => setDelTarget(null)}
          onConfirm={() => deleteSubCategory(delTarget.id).then(() => { setDelTarget(null); loadSubs(selCat); })}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════ */
const TABS = [
  { key: 'departments',    label: 'Danh mục lớn'  },
  { key: 'categories',     label: 'Danh mục'       },
  { key: 'subcategories',  label: 'Danh mục con'   },
];

export default function AdminCategories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const validTabs = ['departments', 'categories', 'subcategories'];
  const [tab, setTab] = useState(validTabs.includes(tabParam) ? tabParam : 'departments');

  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam) && tabParam !== tab) {
      setTab(tabParam);
    }
  }, [tabParam]);

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Danh mục</h1>
        <p className="text-sm text-slate-500 mt-0.5">Quản lý danh mục lớn, danh mục và danh mục con</p>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t.key
                ? 'bg-white text-violet-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'departments'   && <DepartmentsTab />}
      {tab === 'categories'    && <CategoriesTab />}
      {tab === 'subcategories' && <SubCategoriesTab />}
    </div>
  );
}
