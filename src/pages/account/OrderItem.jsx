import { useState } from 'react';
import { Eye } from 'lucide-react';
import { ShoppingBag } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/format';
import { getOrderDetails } from '../../services/orderService';

export default function OrderItem({ order }) {
  const [showProducts, setShowProducts] = useState(false);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const loadDetails = async () => {
    if (loadingDetails || showProducts) return;
    try {
      setLoadingDetails(true);
      const details = await getOrderDetails(order.id);
      setOrderDetails(details);
      setShowProducts(true);
    } catch (error) {
      console.error('Lỗi chi tiết đơn hàng:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="rounded-2xl border border-stone-200 p-6 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg">#{order.order_code}</h3>
          <p className="text-sm text-stone-500">{formatDate(order.order_date)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
            'bg-stone-100 text-stone-800'
          }`}>
            {order.status}
          </span>
          <button 
            onClick={loadDetails} 
            disabled={loadingDetails}
            className="btn-outline px-4 py-1 text-xs flex items-center gap-1 hover:bg-stone-50"
          >
            {loadingDetails ? (
              <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            Chi tiết
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <p><span className="font-medium">Khách hàng:</span> {order.full_name}</p>
        <p><span className="font-medium">Điện thoại:</span> {order.phone_number}</p>
        <p><span className="font-medium">Email:</span> {order.email}</p>
        <p><span className="font-medium">Địa chỉ:</span> {order.address}</p>
      </div>
      <div className="flex items-center justify-between mb-6">
        <span className="font-bold text-2xl">{formatCurrency(order.total_money)}</span>
        <span className="text-sm text-stone-500">Thanh toán: {order.payment?.name || 'N/A'}</span>
      </div>
      {showProducts && (
        <div className="bg-stone-50 p-6 rounded-2xl border">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-stone-600" />
            Sản phẩm ({orderDetails.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orderDetails.map((detail) => (
              <div key={detail.id} className="flex gap-3 p-4 bg-white border rounded-xl hover:shadow-sm transition-shadow">
                <img 
                  src={detail.product_variant.product.thumbnail ? `/shopclothes/api/v1/product-images/images/${detail.product_variant.product.thumbnail}` : '/placeholder.jpg'} 
                  alt={detail.product_variant.product.name} 
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0" 
                />
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-sm line-clamp-2 mb-1">{detail.product_variant.product.name}</h5>
                  <p className="text-xs text-stone-500 mb-1">
                    Màu: {detail.product_variant.color.name} / Size: {detail.product_variant.size.name}
                  </p>
                  <div className="text-sm">
                    <div className="font-semibold mb-1">{formatCurrency(detail.price)} × {detail.quantity}</div>
                    <div className="text-stone-600 font-medium">{formatCurrency(detail.total_money)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

