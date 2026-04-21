import MainLayout from '../../layouts/MainLayout';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { formatCurrency } from '../../utils/format';

export default function CheckoutPage() {
  const { cartItems, cartTotal } = useShop();
  const { user } = useAuth();
  const userId = user?.id;

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone_number: user?.phone_number || '',
    email: user?.email || '',
    address: '',
    note: '',
    province: '',
    district: '',
    ward: '',
  });

  const [paymentMethod, setPaymentMethod] = useState(1); // 1=COD, 2=e-wallet, 3=bank

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cartItemPayload = cartItems.map(item => ({
      product_variant_id: item.productVariantId || item.id,
      quantity: item.quantity
    }));

    const orderPayload = {
      user_id: userId,
      full_name: formData.full_name,
      email: formData.email,
      phone_number: formData.phone_number,
      address: `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.province}`,
      note: formData.note,
      payment_id: paymentMethod,
      cart_items: cartItemPayload
    };

    console.log('ORDER PAYLOAD:', orderPayload);

    try {
      const response = await fetch('/shopclothes/api/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': 'vi'
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await response.json();
      if (response.ok && data.code === 0) {
        // Clear cart, navigate home, success toast
        localStorage.removeItem('cart_items');
        window.location.href = '/';
      } else {
        alert(data.message || 'Đặt hàng thất bại');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Lỗi hệ thống');
    }
  };

  return (
    <MainLayout>
      <section className="container-shell py-8">
        <h1 className="text-4xl font-bold">Thanh toán</h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4 rounded-3xl border border-brand-100 p-6 shadow-card">
            <div className="grid gap-4 md:grid-cols-2">
              <input className="input-base" placeholder="Họ và tên" />
              <input className="input-base" placeholder="Số điện thoại" />
            </div>
            <input className="input-base" placeholder="Địa chỉ email" />
            <input className="input-base" placeholder="Địa chỉ nhận hàng" />
            <div className="grid gap-4 md:grid-cols-3">
              <input className="input-base" placeholder="Tỉnh / Thành phố" />
              <input className="input-base" placeholder="Quận / Huyện" />
              <input className="input-base" placeholder="Phường / Xã" />
            </div>
            <textarea className="input-base min-h-32" placeholder="Ghi chú đơn hàng" />
            <div className="space-y-3 text-sm text-brand-600">
              <label className="flex items-center gap-3"><input type="radio" name="payment" defaultChecked /> Thanh toán khi nhận hàng</label>
              <label className="flex items-center gap-3"><input type="radio" name="payment" /> Thanh toán qua ví điện tử</label>
              <label className="flex items-center gap-3"><input type="radio" name="payment" /> Chuyển khoản ngân hàng</label>
            </div>
          </div>
          <div className="h-fit rounded-3xl border border-brand-100 p-6 shadow-card">
            <h2 className="text-xl font-semibold">Đơn hàng của bạn</h2>
            <div className="space-y-3 mt-6">
              {cartItems.map((item) => (
                <div key={item.productVariantId || item.id} className="flex justify-between py-2 border-b border-stone-200 last:border-b-0">
                  <span>{item.name} ({item.selectedColor}, {item.selectedSize}) x{item.quantity}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-between text-sm font-medium border-t border-brand-100 pt-4">
              <span>Tổng tạm tính</span><span>{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Vận chuyển</span><span>Miễn phí</span>
            </div>
            <div className="mt-6 flex justify-between border-t border-brand-100 pt-4 text-lg font-bold">
              <span>Tổng thanh toán</span><span>{formatCurrency(cartTotal)}</span>
            </div>
            <button className="btn-primary mt-6 w-full">Đặt hàng</button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
