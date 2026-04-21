import { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/format';
import { getUserOrders } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import OrderItem from './OrderItem';

export default function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (user?.id) {
      const fetchOrders = async () => {
        try {
          setLoadingOrders(true);
          const data = await getUserOrders(user.id);
          setOrders(data || []);
        } catch (error) {
          console.error('Lỗi lấy đơn hàng:', error);
          setOrders([]);
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [user?.id]);

  return (
    <div>
      {loadingOrders ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900 mx-auto mb-4" />
          <p className="text-stone-500">Đang tải đơn hàng...</p>
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderItem key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <ShoppingBag className="mx-auto h-16 w-16 text-stone-400 mb-4" />
          <h3 className="text-xl font-semibold text-stone-900 mb-2">Chưa có đơn hàng</h3>
          <p className="text-stone-500 mb-8">Đơn hàng sẽ xuất hiện tại đây sau khi bạn mua sắm.</p>
          <button className="btn-primary">Mua sắm ngay</button>
        </div>
      )}
    </div>
  );
}
