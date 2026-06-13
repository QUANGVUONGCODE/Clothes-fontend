import { useState, useEffect, useCallback } from 'react';
import { Layers, Plus, Edit, Trash2, Loader2, X, Search } from 'lucide-react';
import {
  createVariant,
  updateVariant,
  deleteVariant,
  getProducts,
  getColors,
  getSizes,
  getAllVariants,
} from '../../services/adminService';

function ColorDot({ code }) {
  return (
    <span
      className="w-4 h-4 rounded-full border border-slate-300 inline-block flex-shrink-0"
      style={{ background: code || '#ccc' }}
    />
  );
}

export default function AdminVariants() {
  const [variants, setVariants] = useState([]);
  const [products, setProducts] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    product_id: '',
    color_id: '',
    size_id: '',
    sku: '',
    stock_quantity: 0,
  });

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [error, setError] = useState(null);

  const resetForm = () => {
    setForm({
      product_id: '',
      color_id: '',
      size_id: '',
      stock_quantity: 0,
    });
    setEditing(null);
    setShowForm(false);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, cols, szs, vars] = await Promise.all([
        getProducts('', 0, 1000),
        getColors(),
        getSizes(),
        getAllVariants(),
      ]);

      setProducts(
        prods?.productResponseLists ??
        prods?.result?.productResponseLists ??
        prods?.result ??
        prods ??
        []
      );
      setColors(cols?.colorResponseList ?? cols?.result?.colorResponseList ?? cols?.result ?? cols ?? []);
      setSizes(szs?.sizeResponseList ?? szs?.result?.sizeResponseList ?? szs?.result ?? szs ?? []);

      // Sửa đúng chỗ này: API trả về productVariantResponseList ở root
      setVariants(vars?.productVariantResponseList ?? []);

      console.log('Loaded products:', prods);
      console.log('Loaded colors:', cols);
      console.log('Loaded sizes:', szs);
      console.log('Loaded variants:', vars);
    } catch (error) {
      console.error('Load data failed:', error);
      setError('Không tải được dữ liệu từ backend. Kiểm tra server localhost:8080 và console.');
      setVariants([]);
      setProducts([]);
      setColors([]);
      setSizes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();

    if (!form.product_id || !form.color_id || !form.size_id) {
      alert('Vui lòng chọn đầy đủ sản phẩm, màu và size');
      return;
    }

    setSaving(true);

    try {
      const data = {
        product_id: Number(form.product_id),
        color_id: Number(form.color_id),
        size_id: Number(form.size_id),
        sku: form.sku || `${products.find(p => p.id == form.product_id)?.slug ?? ''}-${colors.find(c => c.id == form.color_id)?.name ?? ''}-${sizes.find(s => s.id == form.size_id)?.name ?? ''}`.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        stock_quantity: Number(form.stock_quantity) || 0,
        status: 'ACTIVE'
      };

      if (editing) {
        await updateVariant(editing.id, data);
      } else {
        await createVariant(data);
      }

      resetForm();
      await loadData();
    } catch (error) {
      console.error('Save variant failed:', error);
      alert(error?.message || 'Có lỗi xảy ra khi lưu biến thể');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (variant) => {
    setEditing(variant);
    setForm({
      product_id: variant?.product?.id?.toString() || variant?.product_id?.toString?.() || '',
      color_id: variant?.color?.id?.toString() || variant?.color_id?.toString?.() || '',
      size_id: variant?.size?.id?.toString() || variant?.size_id?.toString?.() || '',
      sku: variant?.sku ?? variant?.code ?? '',
      stock_quantity: variant?.stockQuantity ?? variant?.stock_quantity ?? 0,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Xoá biến thể này?');
    if (!confirmDelete) return;

    setDeletingId(id);
    try {
      await deleteVariant(id);
      setVariants((prev) => prev.filter((v) => v.id !== id));
    } catch (error) {
      console.error('Delete variant failed:', error);
      alert(error?.message || 'Có lỗi xảy ra khi xoá biến thể');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredVariants = variants.filter((v) => {
    const keyword = search.trim().toLowerCase();

    const matchesSearch =
      keyword === '' ||
      v?.product?.name?.toLowerCase().includes(keyword) ||
      v?.color?.name?.toLowerCase().includes(keyword) ||
      v?.size?.name?.toLowerCase().includes(keyword) ||
      v?.sku?.toLowerCase().includes(keyword);

    const matchesProduct =
      filterProduct === '' || v?.product?.id?.toString() === filterProduct;

    return matchesSearch && matchesProduct;
  });

  console.log('variants state:', variants);
  console.log('filteredVariants:', filteredVariants);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Biến thể sản phẩm</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Quản lý các biến thể màu sắc, kích thước của sản phẩm
          </p>
        </div>

        <button
          onClick={() => {
            setEditing(null);
            setForm({
              product_id: '',
              color_id: '',
              size_id: '',
              stock_quantity: 0,
            });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl shadow transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm biến thể
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm biến thể..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        <select
          value={filterProduct}
          onChange={(e) => setFilterProduct(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="">Tất cả sản phẩm</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-slate-800 text-sm">
              {editing ? 'Sửa biến thể' : 'Thêm biến thể mới'}
            </p>

            <button
              onClick={resetForm}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleAddOrUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Sản phẩm</label>
              <select
                value={form.product_id}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, product_id: e.target.value }))
                }
                className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400"
                required
              >
                <option value="">Chọn sản phẩm</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Màu</label>
              <select
                value={form.color_id}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, color_id: e.target.value }))
                }
                className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400"
                required
              >
                <option value="">Chọn màu</option>
                {colors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Size</label>
              <select
                value={form.size_id}
                onChange={(e) => {
                  const sizeId = e.target.value;
                  setForm((prev) => {
                    // Auto-generate SKU
                    let sku = '';
                    if (prev.product_id && prev.color_id && sizeId) {
                      const product = products.find(p => p.id == prev.product_id);
                      const color = colors.find(c => c.id == prev.color_id);
                      const size = sizes.find(s => s.id == sizeId);
                      if (product && color && size) {
                        sku = `${product.slug}-${color.name}-${size.name}`.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                      }
                    }
                    return { ...prev, size_id: sizeId, sku };
                  });
                }}
                className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400"
                required
              >
                <option value="">Chọn size</option>
                {sizes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">SKU <span className="text-slate-400">(auto)</span></label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm(prev => ({ ...prev, sku: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                placeholder="Auto-generated..."
                className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 font-mono"
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-medium text-slate-500">Số lượng tồn kho</label>
              <input
                type="number"
                min="0"
                value={form.stock_quantity}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    stock_quantity: Number(e.target.value) || 0,
                  }))
                }
                className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400"
                required
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Huỷ
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {editing ? 'Cập nhật' : 'Lưu'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-violet-500" />
            <p className="text-sm text-slate-400">Đang tải...</p>
          </div>
        ) : filteredVariants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Layers className="w-12 h-12 text-slate-200" />
            {error ? (
              <p className="text-red-500 text-sm font-medium max-w-md text-center">{error}</p>
            ) : products.length === 0 || colors.length === 0 || sizes.length === 0 ? (
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-1">Chưa có dữ liệu cần thiết</p>
                <div className="text-xs text-slate-500 space-y-0.5">
                  <p>• Tạo sản phẩm: <a href="/admin/products" className="text-violet-600 hover:underline font-medium">AdminProducts</a></p>
                  <p>• Tạo màu sắc: <a href="/admin/colors" className="text-violet-600 hover:underline font-medium">AdminColors</a></p>
                  <p>• Tạo kích thước: <a href="/admin/sizes" className="text-violet-600 hover:underline font-medium">AdminSizes</a></p>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">Chưa có biến thể nào</p>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-12">
                  ID
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Màu
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tồn kho
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredVariants.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{v.id}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-800">
                    {v.product?.name}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <ColorDot code={v.color?.code} />
                      <span className="text-sm">{v.color?.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-sm">
                      {v.size?.name}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
                    {v.sku}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">
                    {v.stockQuantity}
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(v)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Sửa
                    </button>

                    <button
                      onClick={() => handleDelete(v.id)}
                      disabled={deletingId === v.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all disabled:opacity-50"
                    >
                      {deletingId === v.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
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