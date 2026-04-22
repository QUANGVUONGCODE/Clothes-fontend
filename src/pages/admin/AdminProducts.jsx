import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, Search, Pencil, Trash2, X, ChevronLeft, ChevronRight, Camera,
  Package, AlertTriangle, CheckCircle, Loader2, ChevronDown, Layers
} from 'lucide-react';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
  getVariantsByProduct, createVariant, updateVariant, deleteVariant,
  getColors, getSizes, uploadProductImages,
} from '../../services/adminService';
import { getDepartments } from '../../services/departmentService';
import { getCategoriesByDepartmentId } from '../../services/categoryService';
import { getSubCategoriesByCategoryId } from '../../services/subCategoryService';
import { formatCurrency } from '../../utils/format';

const IMAGE_BASE = '/shopclothes/api/v1/product-images/images';

const EMPTY_FORM = {
  name: '', subcategory_id: '', slug: '', description: '',
  short_description: '', material: '', price: '', discount_percent: 0,
};

const STATUS_CFG = {
  ACTIVE:   { label: 'Đang bán', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  INACTIVE: { label: 'Ẩn',       color: 'text-slate-600 bg-slate-100 border-slate-200',      dot: 'bg-slate-400'  },
};

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-');
}

/* ─────────────────────────────────────────
   SubCategoryCombobox
   mode="all"        → load toàn bộ, searchable
   mode="byCategory" → load theo categoryId
───────────────────────────────────────── */
function SubCategoryCombobox({ mode, categoryId, value, onChange }) {
  const [options, setOptions]   = useState([]);
  const [loadingOpts, setLoadingOpts] = useState(false);
  const [search, setSearch]     = useState('');
  const [open, setOpen]         = useState(false);
  const boxRef                  = useRef(null);

  // Label hiển thị cho giá trị đang chọn
  const selectedLabel = options.find(o => o.id === Number(value))?.label ?? '';

  /* Load options */
  useEffect(() => {
    if (mode === 'byCategory' && !categoryId) return;
    let cancelled = false;

    const load = async () => {
      setLoadingOpts(true);
      try {
        let flat = [];

        if (mode === 'byCategory') {
          // Chỉ load subcategories của 1 category
          const subs = await getSubCategoriesByCategoryId(categoryId);
          flat = subs.map(s => ({
            id: s.id,
            label: s.name,
            meta: '',
          }));
        } else {
          // Load tất cả: dept → category → sub
          const depts = await getDepartments();
          const catGroups = await Promise.all(
            depts.map(d => getCategoriesByDepartmentId(d.id).then(cats =>
              cats.map(c => ({ ...c, deptName: d.name }))
            ))
          );
          const allCats = catGroups.flat();
          const subGroups = await Promise.all(
            allCats.map(c => getSubCategoriesByCategoryId(c.id).then(subs =>
              subs.map(s => ({
                id:    s.id,
                label: s.name,
                meta:  `${c.deptName} › ${c.name}`,
              }))
            ))
          );
          flat = subGroups.flat();
        }

        if (!cancelled) setOptions(flat);
      } catch (e) {
        console.error('Load subcategories error:', e);
      } finally {
        if (!cancelled) setLoadingOpts(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [mode, categoryId]);

  /* Đóng khi click ngoài */
  useEffect(() => {
    const handler = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Prevent dropdown close on trigger click */
  const handleTriggerClick = useCallback((e) => {
    e.stopPropagation();
    setOpen(p => !p);
  }, []); 

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase()) ||
    o.meta.toLowerCase().includes(search.toLowerCase())
  );

  const select = (opt) => {
    onChange(opt.id);
    setSearch('');
    setOpen(false);
  };

  return (
    <div ref={boxRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white text-sm text-left"
      >
        <span className={value ? 'text-slate-900' : 'text-slate-400'}>
          {loadingOpts
            ? 'Đang tải...'
            : value
              ? selectedLabel || `ID: ${value}`
              : 'Chọn danh mục con...'}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
{open && (
        <div className="absolute z-[1000] mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"> 
          {/* Search input (chỉ khi mode=all) */}
          {mode === 'all' && (
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm danh mục..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg bg-slate-50 border-0 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>
            </div>
          )}


          {/* Options list */}
          <div className="max-h-52 overflow-y-auto">
            {loadingOpts ? (
              <div className="flex items-center justify-center py-6 gap-2 text-slate-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Đang tải...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-sm">Không tìm thấy</div>
            ) : (
              filtered.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => select(opt)}
                  className={`w-full text-left px-4 py-2.5 hover:bg-violet-50 transition-colors flex items-center justify-between gap-2 ${
                    Number(value) === opt.id ? 'bg-violet-50 text-violet-700' : 'text-slate-700'
                  }`}
                >
                  <span className="text-sm font-medium">{opt.label}</span>
                  {opt.meta && (
                    <span className="text-xs text-slate-400 flex-shrink-0">{opt.meta}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Modal Form (thêm / sửa)
───────────────────────────────────────── */
function ProductModal({ initial, onClose, onSaved }) {
  const isEdit = !!initial?.id;

  // categoryId dùng để lọc subcategory khi edit
  const editCategoryId = initial?.categoryId ?? null;

  const [form, setForm]     = useState(initial ? { ...EMPTY_FORM, ...initial } : { ...EMPTY_FORM });
  const [colorGroups, setColorGroups] = useState([{ colorId: '', images: [] }]);
  const [colors, setColors] = useState([]);  
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  const set = (field, value) =>
    setForm(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'name' && !isEdit ? { slug: slugify(value) } : {}),
    }));

  // Load colors
  useEffect(() => {
    getColors().then(data => {
      setColors(Array.isArray(data) ? data : data?.colorResponseList ?? data ?? []);
    }).catch(console.error);
  }, []);

// Fixed z-index applied to all modals
  const addColorGroup = () => {
    setColorGroups(prev => [...prev, { colorId: '', images: [] }]);
  };

  // Update group field
  const updateGroup = (index, field, value) => {
    setColorGroups(prev => prev.map((g, i) => 
      i === index ? { ...g, [field]: value } : g
    ));
  };

  // Add images to group
  const addImagesToGroup = (index, e) => {
    const newFiles = Array.from(e.target.files);
    setColorGroups(prev => prev.map((g, i) => 
      i === index ? { ...g, images: [...g.images, ...newFiles] } : g
    ));
  };

  // Remove image from group
  const removeImageFromGroup = (groupIndex, imageIndex) => {
    setColorGroups(prev => prev.map((g, gi) => 
      gi === groupIndex ? { ...g, images: g.images.filter((_, ii) => ii !== imageIndex) } : g
    ));
  };

  // Remove group
  const removeGroup = (index) => {
    setColorGroups(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!form.name.trim() || !form.subcategory_id || !form.price) {
      setErr('Vui lòng điền đầy đủ các trường bắt buộc (*)');
      return;
    }
    setSaving(true);
    try {
      const body = {
        name:              form.name.trim(),
        subcategory_id:    Number(form.subcategory_id),
        slug:              form.slug.trim(),
        description:       form.description.trim(),
        short_description: form.short_description.trim(),
        material:          form.material.trim(),
        price:             Number(form.price),
        discount_percent:  Number(form.discount_percent),
      };

      let productId;
      if (isEdit) {
        await updateProduct(initial.id, body);
        productId = initial.id;
      } else {
        const newProduct = await createProduct(body);
        productId = newProduct.id || newProduct.productId;
      }

  // Upload all color groups - only for EDIT mode
      if (isEdit && colorGroups.some(g => g.colorId && g.images.length > 0)) {
        setUploading(true);
        for (const group of colorGroups) {
          if (group.colorId && group.images.length > 0) {
            await uploadProductImages(Number(productId), Number(group.colorId), group.images);
          }
        }
      }

      onSaved();
    } catch (error) {
      setErr(error.message ?? 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm pointer-events-none">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col pointer-events-auto z-[1001]"> 

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-900">
            {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {err && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {err}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="VD: Quần leggings Sportswear Classic"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Slug</label>
            <input
              value={form.slug}
              onChange={e => set('slug', e.target.value)}
              placeholder="tu-dong-tao-tu-ten"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm font-mono"
            />
          </div>

          {/* SubCategory */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Danh mục con <span className="text-red-500">*</span>
              {isEdit && editCategoryId && (
                <span className="ml-2 text-xs font-normal text-slate-400">
                  (lọc theo category hiện tại)
                </span>
              )}
            </label>
            <SubCategoryCombobox
              mode={isEdit ? 'byCategory' : 'all'}
              categoryId={editCategoryId}
              value={form.subcategory_id}
              onChange={val => set('subcategory_id', val)}
            />
          </div>

          {/* Price + Discount + Material */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Giá (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                type="number" min={0}
                value={form.price}
                onChange={e => set('price', e.target.value)}
                placeholder="249000"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Giảm giá (%)</label>
              <input
                type="number" min={0} max={100}
                value={form.discount_percent}
                onChange={e => set('discount_percent', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Chất liệu</label>
              <input
                value={form.material}
                onChange={e => set('material', e.target.value)}
                placeholder="Cotton, Polyester..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
              />
            </div>
          </div>


          {/* Color Groups - MULTIPLE COLORS + IMAGES - EDIT ONLY */}
          {isEdit && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-4">
                Thêm/Cập nhật màu sắc &amp; ảnh
              </label>
              {colorGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="border border-slate-200 rounded-2xl p-4 mb-4 bg-slate-50/30">

                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-800">Nhóm màu {groupIndex + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeGroup(groupIndex)}
                      className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Color select */}
                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Màu sắc *</label>
                    <select
                      value={group.colorId}
                      onChange={e => updateGroup(groupIndex, 'colorId', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm bg-white"
                    >
                      <option value="">Chọn màu</option>
                      {colors.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Image Upload */}
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-violet-300 bg-white text-center group relative">
                    <input
                      id={`image-upload-${groupIndex}`}
                      type="file"
                      multiple
                      accept="image/*"
                      className="sr-only"
                      onChange={e => addImagesToGroup(groupIndex, e)}
                    />
                    <label 
                      htmlFor={`image-upload-${groupIndex}`}
                      className="block w-full h-full cursor-pointer flex flex-col items-center justify-center pointer-events-auto"
                    >
                      <Package className="w-12 h-12 text-slate-400 group-hover:text-violet-500 transition-colors mb-2" />
                      <p className="text-sm font-medium text-slate-700 group-hover:text-violet-600 mb-1 transition-colors">Click chọn ảnh cho màu này</p>
                      <p className="text-xs text-slate-400">PNG, JPG, max 5MB</p>
                    </label>
                  </div> 


                  {group.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {group.images.map((img, imgIndex) => (
                        <div key={imgIndex} className="relative group">
                          <img
                            src={URL.createObjectURL(img)}
                            alt="Preview"
                            className="w-16 h-16 object-cover rounded-lg shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeImageFromGroup(groupIndex, imgIndex)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <span className="text-xs text-slate-500 mt-1">{group.images.length} ảnh</span>
                    </div>
                  )}
                </div>
              ))}


              <button
                type="button"
                onClick={addColorGroup}
                className="w-full flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 border-2 border-dashed border-emerald-200 text-sm font-semibold text-emerald-700 rounded-xl transition-all"
              >
                <Plus className="w-4 h-4" />
                Thêm màu &amp; ảnh mới
              </button>
              {colorGroups.length === 0 && (
                <p className="text-sm text-slate-500 mt-2 text-center">Chưa có màu nào. Nhấn nút trên để thêm.</p>
              )}
            </div>
          )}


          {/* Short description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mô tả ngắn</label>
            <input
              value={form.short_description}
              onChange={e => set('short_description', e.target.value)}
              placeholder="Tóm tắt nổi bật sản phẩm"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mô tả chi tiết</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Mô tả đầy đủ về sản phẩm..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0">
          <button
            type="button" onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Huỷ
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
          >
            {(saving || uploading)
              ? <><Loader2 className="w-4 h-4 animate-spin" /> {uploading ? 'Đang upload ảnh...' : 'Đang lưu...'}</>
              : <><CheckCircle className="w-4 h-4" /> {isEdit ? 'Cập nhật' : 'Thêm mới'}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Variant Modal
───────────────────────────────────────── */
const EMPTY_VARIANT = { color_id: '', size_id: '', stock_quantity: '' };

function VariantModal({ product, onClose }) {
  const [variants, setVariants]   = useState([]);
  const [colors, setColors]       = useState([]);
  const [sizes, setSizes]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [form, setForm]           = useState(EMPTY_VARIANT);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving]       = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [err, setErr]             = useState('');

  const loadVariants = useCallback(async () => {
    try {
      const data = await getVariantsByProduct(product.id);
      setVariants(data?.productVariantResponseList ?? data ?? []);
    } catch (e) { console.error(e); }
  }, [product.id]);

  useEffect(() => {
    (async () => {
      try {
        const [v, c, s] = await Promise.all([
          getVariantsByProduct(product.id),
          getColors(),
          getSizes(),
        ]);
        setVariants(v?.productVariantResponseList ?? v ?? []);
        setColors(c?.colorResponseList ?? c ?? []);
        setSizes(s?.sizeResponseList ?? s ?? []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [product.id]);

  const openEdit = (v) => {
    setEditingId(v.id);
    setForm({
      color_id:       v.color?.id ?? '',
      size_id:        v.size?.id  ?? '',
      stock_quantity: v.stockQuantity ?? '',
    });
    setErr('');
  };

  const resetForm = () => { setForm(EMPTY_VARIANT); setEditingId(null); setErr(''); };

  const handleSave = async () => {
    if (!form.color_id || !form.size_id || form.stock_quantity === '') {
      setErr('Vui lòng điền đầy đủ màu, size và số lượng.');
      return;
    }
    setSaving(true);
    setErr('');
    try {
      const selectedColor = colors.find(c => c.id === Number(form.color_id));
      const selectedSize  = sizes.find(s => s.id === Number(form.size_id));
      const autoSku = selectedColor && selectedSize
        ? `${product.slug}-${selectedColor.name}-${selectedSize.name}`.toLowerCase().replace(/\s+/g, '-')
        : undefined;

      const body = {
        product_id:     product.id,
        color_id:       Number(form.color_id),
        size_id:        Number(form.size_id),
        stock_quantity: Number(form.stock_quantity),
        status:         'ACTIVE',
        ...(autoSku && !editingId ? { sku: autoSku } : {}),
      };
      if (editingId) await updateVariant(editingId, body);
      else           await createVariant(body);
      await loadVariants();
      resetForm();
    } catch (e) {
      setErr(e.message ?? 'Lỗi khi lưu biến thể.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteVariant(id);
      await loadVariants();
    } catch (e) { alert(e.message); }
    finally { setDeletingId(null); }
  };

  const colorName  = (id) => colors.find(c => c.id === Number(id))?.name ?? id;
  const sizeName   = (id) => sizes.find(s => s.id === Number(id))?.name ?? id;

  return (
  <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm pointer-events-none">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col pointer-events-auto z-[1001] relative"> 

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Biến thể sản phẩm</h2>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{product.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Add / Edit form */}
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/60">
            <p className="text-sm font-bold text-slate-700 mb-3">
              {editingId ? 'Chỉnh sửa biến thể' : 'Thêm biến thể mới'}
            </p>
            {err && (
              <div className="flex items-center gap-2 p-3 mb-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {err}
              </div>
            )}
            <div className="grid grid-cols-3 gap-3">
              {/* Color */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Màu sắc *</label>
                <select
                  value={form.color_id}
                  onChange={e => setForm(p => ({ ...p, color_id: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm bg-white"
                >
                  <option value="">Chọn màu</option>
                  {colors.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Size */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Size *</label>
                <select
                  value={form.size_id}
                  onChange={e => setForm(p => ({ ...p, size_id: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm bg-white"
                >
                  <option value="">Chọn size</option>
                  {sizes.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Số lượng *</label>
                <input
                  type="number" min={0}
                  value={form.stock_quantity}
                  onChange={e => setForm(p => ({ ...p, stock_quantity: e.target.value }))}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...</>
                  : <><CheckCircle className="w-4 h-4" /> {editingId ? 'Cập nhật' : 'Thêm biến thể'}</>
                }
              </button>
              {editingId && (
                <button onClick={resetForm} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                  Huỷ
                </button>
              )}
            </div>
          </div>

          {/* Variant list */}
          <div className="px-6 py-5">
            {loading ? (
              <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Đang tải biến thể...</span>
              </div>
            ) : variants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Layers className="w-10 h-10 text-slate-200" />
                <p className="text-slate-400 text-sm">Chưa có biến thể nào</p>
              </div>
            ) : (
              <div className="space-y-2">
                {variants.map((v) => {
                  const colorName  = v.color?.name ?? '—';
                  const colorCode  = v.color?.code ?? null;
                  const sizeName   = v.size?.name  ?? '—';
                  const stock      = v.stockQuantity ?? 0;
                  const sku        = v.sku ?? null;
                  const isDeleting = deletingId === v.id;

                  return (
                    <div key={v.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Color */}
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0"
                            style={{ background: colorCode ?? '#ccc' }}
                          />
                          <span className="text-sm font-semibold text-slate-800">{colorName}</span>
                        </div>

                        {/* Size */}
                        <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
                          {sizeName}
                        </span>

                        {/* Stock */}
                        <span className={`text-sm font-semibold ${stock === 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                          {stock === 0 ? 'Hết hàng' : `${stock} cái`}
                        </span>

                        {/* SKU */}
                        {sku && (
                          <span className="text-xs text-slate-400 font-mono hidden sm:inline">{sku}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => openEdit(v)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          disabled={isDeleting}
                          className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                          title="Xoá"
                        >
                          {isDeleting
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4" />
                          }
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Delete Confirm
───────────────────────────────────────── */
function DeleteConfirm({ product, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    setLoading(true);
    try {
      await deleteProduct(product.id);
      onDeleted();
    } catch (e) {
      alert(e.message);
      setLoading(false);
    }
  };

  return (
  <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm pointer-events-none">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 pointer-events-auto z-[1001] relative"> 
        <div className="flex items-center justify-center w-14 h-14 bg-red-100 rounded-2xl mx-auto mb-4">
          <Trash2 className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-base font-bold text-slate-900 text-center mb-1">Xoá sản phẩm?</h3>
        <p className="text-sm text-slate-500 text-center mb-6">
          Sản phẩm <span className="font-semibold text-slate-700">"{product.name}"</span> sẽ bị xoá vĩnh viễn.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            Huỷ
          </button>
          <button onClick={confirm} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Xoá
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main Page
───────────────────────────────────────── */
export default function AdminProducts() {
  const [products, setProducts]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [keyword, setKeyword]             = useState('');
  const [page, setPage]                   = useState(0);
  const [hasMore, setHasMore]             = useState(true);
  const [showModal, setShowModal]         = useState(false);
  const [editTarget, setEditTarget]       = useState(null);
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [variantProduct, setVariantProduct] = useState(null);
  const [imageUploadProduct, setImageUploadProduct] = useState(null);
  
  const LIMIT = 10;

  const load = useCallback(async (kw = keyword, p = page) => {
    setLoading(true);
    try {
      const data = await getProducts(kw, p, LIMIT);
      const list = data?.productResponseLists ?? [];
      setProducts(list);
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

  const handleSaved = () => {
    setShowModal(false);
    setEditTarget(null);
    load();
  };

  const openEdit = (p) => {
    setEditTarget({
      id:                p.id,
      name:              p.name,
      subcategory_id:    p.subCategory?.id ?? '',
      categoryId:        p.subCategory?.category?.id ?? null,   // dùng để lọc subcategory
      slug:              p.slug ?? '',
      description:       p.description ?? '',
      short_description: p.shortDescription ?? '',
      material:          p.material ?? '',
      price:             p.price,
      discount_percent:  p.discountPercent ?? 0,
    });
    setShowModal(true);
  };

  const openImageUpload = useCallback((product) => {
    setImageUploadProduct(product);
  }, []);

  return (
    <div className="space-y-5">
      {/* Heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Sản phẩm</h1>
          <p className="text-sm text-slate-500 mt-0.5">Quản lý toàn bộ sản phẩm trong hệ thống</p>
        </div>
        <button
          onClick={() => { setEditTarget(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-violet-300"
        >
          <Plus className="w-4 h-4" /> Thêm sản phẩm
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 shadow-sm">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={keyword}
            onChange={handleSearch}
            placeholder="Tìm theo tên sản phẩm..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            <p className="text-sm text-slate-400">Đang tải sản phẩm...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Package className="w-12 h-12 text-slate-200" />
            <p className="text-slate-400 text-sm">Không tìm thấy sản phẩm nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left border-b border-slate-100">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-12">ID</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sản phẩm</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Danh mục</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Giá</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Giảm</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const cfg = STATUS_CFG[p.status] ?? STATUS_CFG.INACTIVE;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{p.id}</td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {p.thumbnail ? (
                            <img
                              src={`${IMAGE_BASE}/${p.thumbnail}`}
                              alt={p.name}
                              className="w-10 h-10 rounded-xl object-cover flex-shrink-0 bg-slate-100"
                              onError={e => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                              <Package className="w-5 h-5 text-slate-300" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate max-w-[220px]">{p.name}</p>
                            <p className="text-xs text-slate-400">{p.material}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <p className="text-slate-700 font-medium">{p.subCategory?.name ?? '—'}</p>
                        <p className="text-xs text-slate-400">{p.subCategory?.category?.name}</p>
                      </td>

                      <td className="px-5 py-3.5 font-semibold text-slate-900">{formatCurrency(p.price)}</td>

                      <td className="px-5 py-3.5">
                        {p.discountPercent > 0 ? (
                          <span className="px-2 py-0.5 text-xs font-bold bg-red-100 text-red-600 rounded-full">
                            -{p.discountPercent}%
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 justify-end">

                          <button
                            onClick={() => setVariantProduct(p)}
                            className="p-2 rounded-lg hover:bg-violet-50 text-slate-400 hover:text-violet-600 transition-colors"
                            title="Quản lý biến thể"
                          >
                            <Layers className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openImageUpload(p)}
                            className="p-2 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                            title="Upload ảnh sản phẩm"
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEdit(p)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                            title="Xoá"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && products.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Trang <span className="font-semibold text-slate-700">{page + 1}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Trước
              </button>
              <button
                disabled={!hasMore}
                onClick={() => setPage(p => p + 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Sau <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <ProductModal
          initial={editTarget}
          onClose={() => { setShowModal(false); setEditTarget(null); }}
          onSaved={handleSaved}
        />
      )}
      {variantProduct && (
        <VariantModal
          product={variantProduct}
          onClose={() => setVariantProduct(null)}
        />
      )}
      {imageUploadProduct && (
        <ImageUploadModal 
          product={imageUploadProduct} 
          onClose={() => setImageUploadProduct(null)} 
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          product={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => { setDeleteTarget(null); load(); }}
        />
      )}
    </div>
  );
}

function ImageUploadModal({ product, onClose }) {
  const [colors, setColors] = useState([]);
  const [selectedColorId, setSelectedColorId] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getColors().then(setColors).catch(console.error);
  }, []);

  const handleUpload = async () => {
    if (!selectedColorId || files.length === 0) {
      setError('Chọn màu và ảnh');
      return;
    }
    setUploading(true);
    try {
      await uploadProductImages(product.id, Number(selectedColorId), files);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const addFiles = (e) => {
    setFiles(prev => [...prev, ...Array.from(e.target.files)]);
    setError('');
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Thêm ảnh - {product.name}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}
          
          <div className="relative">
            <label className="block text-sm font-medium text-slate-700 mb-2">Chọn màu *</label>
            <div className="relative z-20">
              <select 
                id="color-select"
                value={selectedColorId}
                onChange={async (e) => {
                  console.log('Color changed:', e.target.value);
                  setSelectedColorId(e.target.value);
                }}
                className="w-full p-3 pr-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 appearance-none bg-white cursor-pointer relative z-20"
              >
                <option value="">Chọn màu</option>
                {colors.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Ảnh sản phẩm</label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-emerald-300 transition-colors relative">
              <input
                id="image-upload-modal"
                type="file"
                multiple
                accept="image/*"
                onChange={addFiles}
                className="sr-only"
              />
              <label 
                htmlFor="image-upload-modal" 
                className="cursor-pointer block w-full h-full flex flex-col items-center justify-center"
              >
                <Package className="w-12 h-12 mx-auto mb-3 text-slate-400 hover:text-emerald-500 transition-colors" />
                <p className="text-slate-600 mb-1 hover:text-emerald-600 transition-colors">Click chọn ảnh</p>
                <p className="text-xs text-slate-400">{files.length} ảnh đã chọn</p>
              </label>
            </div>
          </div>

          {files.length > 0 && (
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl">
              {files.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-slate-100">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Huỷ
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || !selectedColorId || files.length === 0}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang upload...
              </>
            ) : (
              'Upload ảnh'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
