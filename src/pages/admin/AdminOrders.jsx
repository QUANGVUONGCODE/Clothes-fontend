import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, ChevronLeft, ChevronRight, Eye, ChevronDown,
  ShoppingCart, Loader2, X, Package, MapPin, Phone,
  User, Calendar, CreditCard, FileText, Receipt, Mail, Printer
} from 'lucide-react';
import {
  getAllOrders,
  getInvoiceByOrderCode,
  updateOrderStatus,
} from '../../services/adminService';
import { getOrderDetails } from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils/format';

/* ─── constants ─── */
const STATUS_LIST = [
  { value: '',           label: 'Tất cả'      },
  { value: 'PENDING',    label: 'Chờ xử lý'   },
  { value: 'CONFIRMED',  label: 'Đã xác nhận' },
  { value: 'SHIPPED',   label: 'Đang giao'    },
  { value: 'COMPLETED',  label: 'Hoàn thành'  },
  { value: 'CANCELLED',  label: 'Đã huỷ'      },
];

const STATUS_CFG = {
  PENDING:   { label: 'Chờ xử lý',   color: 'text-amber-700 bg-amber-50 border-amber-200',      dot: 'bg-amber-500'   },
  CONFIRMED: { label: 'Đã xác nhận', color: 'text-blue-700 bg-blue-50 border-blue-200',          dot: 'bg-blue-500'    },
  SHIPPED:  { label: 'Đang giao',   color: 'text-violet-700 bg-violet-50 border-violet-200',    dot: 'bg-violet-500'  },
  COMPLETED: { label: 'Hoàn thành',  color: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  CANCELLED: { label: 'Đã huỷ',     color: 'text-red-700 bg-red-50 border-red-200',              dot: 'bg-red-500'     },
};

/* ─── helpers ─── */
function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

/* ─── Status dropdown ─── */
function StatusDropdown({ orderId, current, onUpdated }) {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);

  const change = async (status) => {
    setOpen(false);
    setLoading(true);
    try {
      await updateOrderStatus(orderId, status);
      onUpdated();
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (current === 'COMPLETED' || current === 'CANCELLED') {
    return <StatusBadge status={current} />;
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(p => !p)}
        disabled={loading}
        className="inline-flex items-center gap-1 focus:outline-none"
      >
        {loading
          ? <span className="flex items-center gap-1 text-xs text-slate-400"><Loader2 className="w-3 h-3 animate-spin" /> Đang cập nhật...</span>
          : <><StatusBadge status={current} /><ChevronDown className="w-3 h-3 text-slate-400" /></>
        }
      </button>
      {open && (
        <div className="absolute z-20 mt-1 left-0 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden w-44">
          {STATUS_LIST.filter(s => s.value && s.value !== current).map(s => (
            <button
              key={s.value}
              onClick={() => change(s.value)}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors"
            >
              <StatusBadge status={s.value} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Info row helper ─── */
function InfoRow({ icon: Icon, label, value, highlight }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-400 mb-0.5">{label}</p>
        <p className={`text-sm font-semibold break-words ${highlight ? 'text-violet-700' : 'text-slate-800'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

const IMAGE_BASE = '/shopclothes/api/v1/product-images/images';
const INVOICE_ELIGIBLE_STATUSES = new Set(['CONFIRMED', 'COMPLETED']);

function InvoiceModal({ orderCode, onClose }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemsError, setItemsError] = useState('');

  useEffect(() => {
    let cancelled = false;

    getInvoiceByOrderCode(orderCode)
      .then((data) => {
        if (!cancelled) setInvoice(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Không thể tải hóa đơn.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orderCode]);

  useEffect(() => {
    if (!invoice?.orderId) return;

    let cancelled = false;
    setLoadingItems(true);
    setItemsError('');

    getOrderDetails(invoice.orderId)
      .then((data) => {
        const payload = data?.result ?? data;
        const list =
          payload?.items ??
          payload?.orderItems ??
          payload?.orderItemsList ??
          payload?.details ??
          payload ??
          [];

        if (!cancelled) setItems(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        if (!cancelled) {
          setItems([]);
          setItemsError(err?.message || 'Không thể tải chi tiết sản phẩm.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingItems(false);
      });

    return () => {
      cancelled = true;
    };
  }, [invoice?.orderId]);

  const paymentStatusClass = invoice?.paymentStatus === 'CONFIRMED'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-amber-50 text-amber-700 border-amber-200';

  return (
    <div className="invoice-print-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .invoice-print-root,
          .invoice-print-root * { visibility: visible !important; }
          .invoice-print-root {
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            max-width: none !important;
            max-height: none !important;
            overflow: visible !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
          .invoice-print-actions { display: none !important; }
        }
      `}</style>
      <div className="invoice-print-root flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="invoice-print-actions flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100">
              <Receipt className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Hóa đơn bán hàng</h2>
              <p className="text-xs text-slate-400">{orderCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
              Đang tải hóa đơn...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              {error}
            </div>
          ) : invoice ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between border-b border-slate-200 pb-5">
                <div>
                  <p className="text-2xl font-black uppercase tracking-tight text-slate-900">NovaWear</p>
                  <p className="mt-1 text-xs text-slate-500">Hóa đơn bán hàng điện tử</p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>Mã hóa đơn</p>
                  <p className="mt-1 font-mono font-bold text-slate-900">{invoice.invoiceCode}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-900 p-5 text-white">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400">Mã hóa đơn</p>
                    <p className="mt-1 font-mono text-lg font-bold">{invoice.invoiceCode}</p>
                    <p className="mt-3 text-xs text-slate-400">
                      Phát hành: {invoice.issuedAt ? formatDate(invoice.issuedAt) : '—'}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold">
                      {invoice.status || 'ISSUED'}
                    </span>
                    <p className="mt-4 text-xs text-slate-400">Tổng thanh toán</p>
                    <p className="mt-1 text-2xl font-black text-emerald-300">
                      {formatCurrency(invoice.totalMoney ?? 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Thông tin khách hàng
                </p>
                <div className="divide-y divide-slate-100 rounded-2xl bg-slate-50 px-4">
                  <InfoRow icon={User} label="Khách hàng" value={invoice.customerName} />
                  <InfoRow icon={Mail} label="Email" value={invoice.customerEmail} />
                  <InfoRow icon={Phone} label="Số điện thoại" value={invoice.customerPhone} />
                  <InfoRow icon={MapPin} label="Địa chỉ giao hàng" value={invoice.shippingAddress} />
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Thông tin thanh toán
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs text-slate-400">Mã đơn hàng</p>
                    <p className="mt-1 break-all font-mono text-sm font-semibold text-slate-800">
                      {invoice.orderCode}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs text-slate-400">Phương thức</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {invoice.paymentMethod || '—'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs text-slate-400">Trạng thái thanh toán</p>
                    <span className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${paymentStatusClass}`}>
                      {invoice.paymentStatus || '—'}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs text-slate-400">ID đơn hàng</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      #{invoice.orderId}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Chi tiết đơn hàng
                  </p>
                  {!loadingItems && !itemsError && (
                    <span className="text-xs text-slate-400">{items.length} sản phẩm</span>
                  )}
                </div>

                {loadingItems ? (
                  <div className="flex items-center justify-center gap-2 rounded-2xl bg-slate-50 py-10 text-sm text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                    Đang tải sản phẩm...
                  </div>
                ) : itemsError ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                    {itemsError}
                  </div>
                ) : items.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 py-10 text-center text-sm text-slate-500">
                    Không có dữ liệu sản phẩm.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <div className="hidden grid-cols-[minmax(0,1fr)_70px_110px_120px] gap-3 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 sm:grid">
                      <span>Sản phẩm</span>
                      <span className="text-center">SL</span>
                      <span className="text-right">Đơn giá</span>
                      <span className="text-right">Thành tiền</span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {items.map((item, index) => {
                        const variant = item.product_variant ?? item.productVariant;
                        const product = variant?.product ?? item.product;
                        const quantity = item.quantity ?? 1;
                        const unitPrice = item.price ?? item.unitPrice ?? 0;
                        const lineTotal =
                          item.total_money ??
                          item.totalMoney ??
                          unitPrice * quantity;

                        return (
                          <div
                            key={item.id ?? index}
                            className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_70px_110px_120px] sm:items-center"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              {product?.thumbnail ? (
                                <img
                                  src={`${IMAGE_BASE}/${product.thumbnail}`}
                                  alt={product?.name || 'Sản phẩm'}
                                  className="h-12 w-12 flex-shrink-0 rounded-xl bg-slate-100 object-cover"
                                />
                              ) : (
                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100">
                                  <Package className="h-5 w-5 text-slate-400" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-800">
                                  {product?.name || `Sản phẩm #${index + 1}`}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {variant?.color?.name || '—'} / {variant?.size?.name || '—'}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-slate-700 sm:text-center">
                              <span className="sm:hidden">Số lượng: </span>
                              {quantity}
                            </p>
                            <p className="text-sm text-slate-700 sm:text-right">
                              <span className="sm:hidden">Đơn giá: </span>
                              {formatCurrency(unitPrice)}
                            </p>
                            <p className="text-sm font-bold text-slate-900 sm:text-right">
                              <span className="sm:hidden">Thành tiền: </span>
                              {formatCurrency(lineTotal)}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-4">
                      <span className="text-sm font-semibold text-slate-600">Tổng cộng</span>
                      <span className="text-lg font-black text-emerald-700">
                        {formatCurrency(invoice.totalMoney ?? 0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="invoice-print-actions flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <Printer className="h-4 w-4" />
                  In hóa đơn
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ─── Order detail modal ─── */
function OrderDetailModal({ order, onClose }) {
  const [items, setItems]               = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [richOrder, setRichOrder]       = useState(null);

  useEffect(() => {
    getOrderDetails(order.id)
      .then((data) => {
        // Chuẩn hoá response vì API có thể trả nhiều shape khác nhau
        // - Array: [ { order, product_variant, ... }, ... ]
        // - Object: { result: { order, items: [...] } }
        // - Object: { order: {...}, items:[...] }
        const payload = data?.result ?? data;

        // items
        const list =
          payload?.items ??
          payload?.orderItems ??
          payload?.orderItemsList ??
          payload?.productVariantResponseList ??
          payload?.details ??
          payload ??
          [];

        const normalizedItems = Array.isArray(list) ? list : [];
        setItems(normalizedItems);

        // order
        const ord =
          payload?.order ??
          (Array.isArray(list) && list[0]?.order ? list[0].order : null) ??
          payload?.data?.order ??
          payload?.result?.order ??
          null;
        setRichOrder(ord);
      })
      .catch(() => setItems([]))
      .finally(() => setLoadingItems(false));
  }, [order.id]);

  // Ưu tiên dữ liệu từ API detail, fallback về dữ liệu từ bảng
  const o = richOrder ?? order;
  const name = o?.fullName ?? o?.customerName ?? o?.customer_name ?? '—';
  const phone = o?.phoneNumber ?? o?.phone_number ?? o?.customerPhone ?? null;
  const email = o?.email ?? o?.customerEmail ?? null;

  const address = o?.address ?? o?.SHIPPEDAddress ?? o?.shippingAddress ?? o?.shipAddress ?? null;
  const shippingAddress = address;

  const note = o?.note ?? o?.orderNote ?? null;

  const total = o?.totalMoney ?? o?.total_money ?? 0;
  const orderDate = o?.orderDate ?? o?.createdAt ?? o?.created_at ?? null;
  const orderCode = o?.orderCode ?? o?.code ?? o?.order_code ?? null;

  const paymentObj = o?.payment ?? o?.payments ?? null;
  const payment =
    paymentObj?.description ??
    paymentObj?.name ??
    paymentObj?.method ??
    o?.paymentMethod ??
    o?.payment_method ??
    null;

  const paymentStatus = o?.paymentStatus ?? o?.payment_status ?? null;

  // discount/tax (nếu backend có)
  const subTotal = o?.subTotal ?? o?.subtotal ?? o?.sub_total ?? null;
  const discount = o?.discountMoney ?? o?.discount_money ?? o?.discount ?? null;
  const shippingFee = o?.shippingFee ?? o?.shipping_fee ?? o?.shipFee ?? null;
  const tax = o?.taxMoney ?? o?.tax_money ?? o?.tax ?? null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {orderCode ?? `Đơn hàng #${order.id}`}
              </h2>
              <p className="text-xs text-slate-400">{orderDate ? formatDate(orderDate) : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={o.status ?? order.status} />
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Order info grid */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Thông tin đơn hàng</p>
            <div className="bg-slate-50 rounded-2xl px-4 divide-y divide-slate-100">
              <InfoRow icon={User}       label="Khách hàng"      value={name}                               />
              <InfoRow icon={Phone}      label="Số điện thoại"   value={phone}                              />
              <InfoRow icon={MapPin}     label="Địa chỉ giao"    value={address}                            />
              <InfoRow icon={CreditCard} label="Thanh toán"      value={payment}                            />
              <InfoRow icon={FileText}   label="Ghi chú"         value={note}                               />
              <InfoRow icon={CreditCard} label="Tổng tiền"       value={formatCurrency(total)} highlight    />
            </div>
          </div>

          {/* Line items */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Sản phẩm trong đơn {!loadingItems && items.length > 0 && `(${items.length})`}
            </p>

            {loadingItems ? (
              <div className="flex items-center justify-center py-10 gap-2 text-slate-400 bg-slate-50 rounded-2xl">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Đang tải...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 bg-slate-50 rounded-2xl">
                <Package className="w-8 h-8 text-slate-200" />
                <p className="text-xs text-slate-400">Không có dữ liệu sản phẩm</p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, i) => {
                  const variant     = item.product_variant;
                  const product     = variant?.product;
                  const color       = variant?.color;
                  const size        = variant?.size;
                  const productName = product?.name ?? `Sản phẩm #${i + 1}`;
                  const thumbnail   = product?.thumbnail;
                  const qty         = item.quantity ?? 1;
                  const unitPrice   = item.price ?? 0;
                  const subtotal    = item.total_money ?? unitPrice * qty;

                  return (
                    <div key={item.id ?? i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      {/* Thumbnail */}
                      {thumbnail ? (
                        <img
                          src={`${IMAGE_BASE}/${thumbnail}`}
                          alt={productName}
                          className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-slate-200"
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-slate-400" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{productName}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {/* Color */}
                          {color && (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <span
                                className="w-3 h-3 rounded-full border border-slate-300 flex-shrink-0"
                                style={{ background: color.code ?? '#ccc' }}
                              />
                              {color.name}
                            </span>
                          )}
                          {/* Size */}
                          {size && (
                            <span className="px-1.5 py-0.5 text-xs font-bold bg-white border border-slate-200 rounded-md text-slate-700">
                              {size.name}
                            </span>
                          )}
                          {/* Quantity */}
                          <span className="text-xs text-slate-400">× {qty}</span>
                          {/* Unit price */}
                          <span className="text-xs text-slate-400">{formatCurrency(unitPrice)}/cái</span>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <p className="text-sm font-bold text-slate-900 flex-shrink-0">
                        {formatCurrency(subtotal)}
                      </p>
                    </div>
                  );
                })}

                {/* Total */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 px-1">
                  <span className="text-sm text-slate-500 font-medium">Tổng cộng</span>
                  <span className="text-base font-black text-violet-700">{formatCurrency(total)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ─── */
export default function AdminOrders() {
  const [searchParams]              = useSearchParams();
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [keyword, setKeyword]       = useState('');
  const [status, setStatus]         = useState(() => searchParams.get('status') ?? '');
  const [page, setPage]             = useState(0);
  const [hasMore, setHasMore]       = useState(true);
  const [detailOrder, setDetailOrder] = useState(null);
  const [invoiceOrderCode, setInvoiceOrderCode] = useState(null);
  const LIMIT = 10;

  const load = useCallback(async (kw = keyword, st = status, p = page) => {
    setLoading(true);
    try {
      const data = await getAllOrders(p, LIMIT, st, kw);
      const list = data?.orders ?? data?.orderResponseList ?? data?.result?.orders ?? data ?? [];
      setOrders(Array.isArray(list) ? list : []);
      setHasMore(Array.isArray(list) && list.length === LIMIT);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [keyword, status, page]);

  useEffect(() => { load(); }, [load]);

  // Sync status when navigating via sub-nav URL params
  // Khi bấm lọc trạng thái, keyword phải là TÊN TIẾNG ANH.
  // Sync theo URL => keyword cũng theo status.
  useEffect(() => {
    const urlStatus = searchParams.get('status') ?? '';
    if (urlStatus !== status) {
      setStatus(urlStatus);

      const STATUS_EN = {
        PENDING: 'PENDING',
        CONFIRMED: 'CONFIRMED',
        SHIPPED: 'SHIPPED',
        COMPLETED: 'COMPLETED',
        CANCELLED: 'CANCELLED',
      };

      const kw = STATUS_EN[urlStatus] ?? urlStatus;
      setKeyword(kw);
      setPage(0);
      load(kw, '', 0);
    }
  }, [searchParams]);


  const STATUS_EN = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    SHIPPED: 'SHIPPED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
  };

  const handleStatus = (val) => {
    // Khi bấm lọc trạng thái, backend sẽ nhận keyword = trạng thái tiếng anh
    const kw = STATUS_EN[val] ?? val;
    setKeyword(kw);
    setStatus(val);
    setPage(0);
    load(kw, '', 0);
  };
  const handleSearch = (e) => {
    const kw = e.target.value;
    setKeyword(kw);
    setPage(0);
    // API search sử dụng query keyword để lọc theo thôn/khu vực
    load(kw, status, 0);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Đơn hàng</h1>
        <p className="text-sm text-slate-500 mt-0.5">Quản lý và cập nhật trạng thái đơn hàng</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 shadow-sm flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={keyword}
            onChange={handleSearch}
            placeholder="Tìm mã đơn, khách hàng..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white transition-all"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {STATUS_LIST.map(s => (
            <button
              key={s.value}
              onClick={() => handleStatus(s.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                status === s.value ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            <p className="text-sm text-slate-400">Đang tải đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <ShoppingCart className="w-12 h-12 text-slate-200" />
            <p className="text-slate-400 text-sm">Không có đơn hàng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left border-b border-slate-100">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mã đơn</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Khách hàng</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng tiền</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày đặt</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const orderCode = order.order_code ?? order.orderCode ?? null;
                  const customerName = order.full_name ?? order.customerName ?? order.customer_name ?? '—';
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-semibold text-slate-700">
                        {orderCode ? orderCode : `#${order.id}`}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-800">{customerName}</p>
                        <p className="text-xs text-slate-400">{order.phone_number ?? order.phoneNumber ?? ''}</p>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900">
                        {formatCurrency(order.total_money ?? order.totalMoney ?? 0)}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusDropdown orderId={order.id} current={order.status} onUpdated={() => load()} />
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs">
                        {order.order_date ? formatDate(order.order_date) : order.createdAt ? formatDate(order.createdAt) : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {orderCode && INVOICE_ELIGIBLE_STATUSES.has(order.status) && (
                            <button
                              onClick={() => setInvoiceOrderCode(orderCode)}
                              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                              title="Xem hóa đơn"
                            >
                              <Receipt className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setDetailOrder(order)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
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
        {!loading && orders.length > 0 && (
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

      {detailOrder && (
        <OrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />
      )}
      {invoiceOrderCode && (
        <InvoiceModal
          orderCode={invoiceOrderCode}
          onClose={() => setInvoiceOrderCode(null)}
        />
      )}
    </div>
  );
}
