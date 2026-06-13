import { useEffect, useState } from 'react';
import { Loader2, Package, Printer, Receipt, X } from 'lucide-react';
import { getInvoiceByOrderCode } from '../../services/adminService';
import { getOrderDetails } from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils/format';

const IMAGE_BASE = '/shopclothes/api/v1/product-images/images';

export default function InvoiceModal({ orderCode, onClose }) {
  const [invoice, setInvoice] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getInvoiceByOrderCode(orderCode)
      .then((data) => !cancelled && setInvoice(data))
      .catch((err) => !cancelled && setError(err?.message || 'Không thể tải hóa đơn.'))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [orderCode]);

  useEffect(() => {
    if (!invoice?.orderId) return;
    let cancelled = false;
    setLoadingItems(true);

    getOrderDetails(invoice.orderId)
      .then((data) => {
        const payload = data?.result ?? data;
        const list = payload?.items ?? payload?.orderItems ?? payload?.details ?? payload ?? [];
        if (!cancelled) setItems(Array.isArray(list) ? list : []);
      })
      .catch(() => !cancelled && setItems([]))
      .finally(() => !cancelled && setLoadingItems(false));

    return () => { cancelled = true; };
  }, [invoice?.orderId]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .account-invoice, .account-invoice * { visibility: visible !important; }
          .account-invoice { position: absolute !important; inset: 0 !important; width: 100% !important; max-width: none !important; max-height: none !important; overflow: visible !important; box-shadow: none !important; }
          .account-invoice-actions { display: none !important; }
        }
      `}</style>

      <div className="account-invoice flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="account-invoice-actions flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <Receipt className="h-6 w-6 text-emerald-600" />
            <div>
              <h2 className="text-xl font-bold">Hóa đơn mua hàng</h2>
              <p className="text-xs text-stone-500">{orderCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-stone-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center gap-2 py-20 text-stone-500">
              <Loader2 className="h-5 w-5 animate-spin" /> Đang tải hóa đơn...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>
          ) : invoice ? (
            <div className="space-y-6">
              <div className="flex justify-between border-b pb-5">
                <div>
                  <p className="text-2xl font-black uppercase">NovaWear</p>
                  <p className="text-xs text-stone-500">Hóa đơn bán hàng điện tử</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-mono font-bold">{invoice.invoiceCode}</p>
                  <p className="mt-1 text-stone-500">{invoice.issuedAt ? formatDate(invoice.issuedAt) : '—'}</p>
                </div>
              </div>

              <div className="grid gap-4 rounded-2xl bg-stone-900 p-5 text-white md:grid-cols-2">
                <div className="space-y-2 text-sm">
                  <p><span className="text-stone-400">Khách hàng:</span> {invoice.customerName}</p>
                  <p><span className="text-stone-400">Email:</span> {invoice.customerEmail}</p>
                  <p><span className="text-stone-400">Điện thoại:</span> {invoice.customerPhone}</p>
                  <p><span className="text-stone-400">Địa chỉ:</span> {invoice.shippingAddress}</p>
                </div>
                <div className="space-y-2 text-sm md:text-right">
                  <p><span className="text-stone-400">Thanh toán:</span> {invoice.paymentMethod}</p>
                  <p><span className="text-stone-400">Trạng thái:</span> {invoice.paymentStatus}</p>
                  <p className="pt-2 text-2xl font-black text-yellow-300">{formatCurrency(invoice.totalMoney ?? 0)}</p>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-bold uppercase text-stone-500">Chi tiết đơn hàng</h3>
                {loadingItems ? (
                  <div className="flex justify-center gap-2 rounded-2xl bg-stone-50 py-8 text-stone-500">
                    <Loader2 className="h-5 w-5 animate-spin" /> Đang tải sản phẩm...
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border">
                    {items.map((item, index) => {
                      const variant = item.product_variant ?? item.productVariant;
                      const product = variant?.product ?? item.product;
                      const quantity = item.quantity ?? 1;
                      const unitPrice = item.price ?? item.unitPrice ?? 0;
                      const total = item.total_money ?? item.totalMoney ?? unitPrice * quantity;

                      return (
                        <div key={item.id ?? index} className="flex items-center gap-3 border-b p-4 last:border-0">
                          {product?.thumbnail ? (
                            <img src={`${IMAGE_BASE}/${product.thumbnail}`} alt={product.name} className="h-14 w-14 rounded-xl object-cover" />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-stone-100">
                              <Package className="h-5 w-5 text-stone-400" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold">{product?.name || `Sản phẩm #${index + 1}`}</p>
                            <p className="text-xs text-stone-500">
                              {variant?.color?.name || '—'} / {variant?.size?.name || '—'} · SL: {quantity}
                            </p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="text-stone-500">{formatCurrency(unitPrice)}</p>
                            <p className="font-bold">{formatCurrency(total)}</p>
                          </div>
                        </div>
                      );
                    })}
                    {!loadingItems && items.length === 0 && (
                      <p className="p-8 text-center text-sm text-stone-500">Không có dữ liệu sản phẩm.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="account-invoice-actions flex justify-end gap-3 border-t pt-5">
                <button onClick={onClose} className="rounded-xl border px-5 py-3 font-semibold">Đóng</button>
                <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-3 font-semibold text-white">
                  <Printer className="h-4 w-4" /> In hóa đơn
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
