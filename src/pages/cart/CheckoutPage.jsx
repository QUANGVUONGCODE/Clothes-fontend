import MainLayout from '../../layouts/MainLayout';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/format';
import { toast } from "sonner";
import {
  Check,
  ChevronRight,
  CreditCard,
  Loader2,
  LockKeyhole,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Truck,
  UserRound,
  WalletCards,
} from 'lucide-react';
import { getProductImageUrl } from '../../services/productService';

export default function CheckoutPage() {

  const { cartItems, cartTotal } = useShop();
  const { user } = useAuth();
  const navigate = useNavigate();

  const userId = user?.id;

  const [loading, setLoading] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState(1);
  const [paymentMethods, setPaymentMethods] = useState([]);

  /* =========================
     ADDRESS
  ========================= */
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  /* =========================
     FORM
  ========================= */
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

  const [errors, setErrors] = useState({});

  /* =========================
     LOAD USER INFO
  ========================= */
  useEffect(() => {

    setFormData((prev) => ({
      ...prev,
      full_name: user?.full_name || '',
      phone_number: user?.phone_number || '',
      email: user?.email || '',
    }));

  }, [user?.full_name, user?.phone_number, user?.email]);

  /* =========================
     LOAD PROVINCES
  ========================= */
  useEffect(() => {

    const loadProvinces = async () => {

      try {

        const res = await fetch(
          'https://provinces.open-api.vn/api/p/'
        );

        const data = await res.json();

        setProvinces(data);

      } catch (error) {

        console.error(error);
      }
    };

    loadProvinces();

  }, []);

  /* =========================
     LOAD PAYMENT METHODS
  ========================= */
  useEffect(() => {

    const loadPaymentMethods = async () => {

      try {

        const { getPaymentMethods } = await import('../../services/paymentsService');

        const res = await getPaymentMethods();

        if (res?.code === 0) {
          setPaymentMethods(res?.result || []);
        }

      } catch (err) {

        console.error('Load payment methods failed:', err);
      }
    };

    loadPaymentMethods();

  }, []);

  /* =========================
     HANDLE INPUT
  ========================= */
  const handleInputChange = async (e) => {

    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // clear error
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));

    /* =========================
       LOAD DISTRICTS
    ========================= */
    if (name === 'province') {

      const selectedProvince = provinces.find(
        (p) => p.name === value
      );

      if (selectedProvince) {

        const res = await fetch(
          `https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=2`
        );

        const data = await res.json();

        setDistricts(data.districts || []);

        setWards([]);

        setFormData(prev => ({
          ...prev,
          province: value,
          district: '',
          ward: '',
        }));
      }
    }

    /* =========================
       LOAD WARDS
    ========================= */
    if (name === 'district') {

      const selectedDistrict = districts.find(
        (d) => d.name === value
      );

      if (selectedDistrict) {

        const res = await fetch(
          `https://provinces.open-api.vn/api/d/${selectedDistrict.code}?depth=2`
        );

        const data = await res.json();

        setWards(data.wards || []);

        setFormData(prev => ({
          ...prev,
          district: value,
          ward: '',
        }));
      }
    }
  };

  /* =========================
     VALIDATE FORM
  ========================= */
  const validateForm = () => {

    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Vui lòng nhập họ tên';
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0|\+84)[0-9]{9,10}$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Số điện thoại không hợp lệ';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }

    if (!formData.province.trim()) {
      newErrors.province = 'Vui lòng chọn tỉnh / thành phố';
    }

    if (!formData.district.trim()) {
      newErrors.district = 'Vui lòng chọn quận / huyện';
    }

    if (!formData.ward.trim()) {
      newErrors.ward = 'Vui lòng chọn phường / xã';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* =========================
     HANDLE SUBMIT
  ========================= */
  const handleSubmit = async (e) => {

    e.preventDefault();

    if (loading) return;

    if (!userId) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    const isValid = validateForm();

    if (!isValid) return;

    try {

      setLoading(true);

      const token = localStorage.getItem('auth_token');

      if (!cartItems.length) {
        toast.error('Giỏ hàng đang trống');
        return;
      }

      const cartItemPayload = cartItems.map(item => ({
        product_variant_id: item.productVariantId || item.id,
        quantity: item.quantity
      }));

      /* =========================
         COD PAYMENT
      ========================= */
      if (paymentMethod === 1) {

        const orderPayload = {
          user_id: userId,
          full_name: formData.full_name,
          email: formData.email,
          phone_number: formData.phone_number,
          address: `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.province}`,
          note: formData.note,
          payment_id: paymentMethod,
          vnp_txn_ref: 'DIRECT_PAYMENT',
          cart_items: cartItemPayload
        };

        const response = await fetch('/shopclothes/api/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept-Language': 'vi',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(orderPayload)
        });

        const data = await response.json();

        if (response.ok && data.code === 0) {
          localStorage.removeItem('cart_items');
          toast.success('🎉 Đặt hàng thành công!');
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        } else {

          toast.error(data.message || 'Đặt hàng thất bại');
        }

        return;
      }

      /* =========================
         VNPAY PAYMENT
      ========================= */
      if (paymentMethod === 2) {

        const { createVnPayPaymentUrl } = await import('../../services/paymentsService');

        const vnPayPayload = {
          amount: Math.round(cartTotal),
          bankCode: '',
          language: 'vn',
        };

        const vnRes = await createVnPayPaymentUrl(vnPayPayload);

        const url = vnRes?.data || vnRes?.url;

        if (!url) {
        toast.error(vnRes?.message || 'Không tạo được liên kết thanh toán VNPay');
        return;
      }

        const txnRef = new URL(url).searchParams.get('vnp_TxnRef');

        if (!txnRef) {
          throw new Error('Không lấy được vnp_TxnRef');
        }

        const orderPayload = {
          user_id: userId,
          full_name: formData.full_name,
          email: formData.email,
          phone_number: formData.phone_number,
          address: `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.province}`,
          note: formData.note,
          payment_id: paymentMethod,
          vnp_txn_ref: txnRef,
          cart_items: cartItemPayload
        };

        const response = await fetch('/shopclothes/api/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept-Language': 'vi',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(orderPayload)
        });

        const data = await response.json();

        if (response.ok && data.code === 0) {
          toast.success('Đang chuyển hướng đến VNPay...');
          window.location.href = url;

        } else {

          toast.error(data.message || 'Tạo đơn hàng thất bại');
        }

        return;
      }

    } catch (error) {

      console.error('Checkout error:', error);
      toast.error(error.message || 'Đã xảy ra lỗi, vui lòng thử lại');

    } finally {

      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <section className="container-shell py-8 sm:py-10">
        <CheckoutSteps />

        <div className="mt-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-600">Secure checkout</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">Hoàn tất đơn hàng</h1>
          <p className="mt-2 text-sm text-stone-500">Kiểm tra thông tin giao hàng và chọn phương thức thanh toán.</p>
        </div>

        <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_410px] lg:items-start">
          <div className="space-y-6">
            <CheckoutSection
              icon={UserRound}
              step="01"
              title="Thông tin người nhận"
              description="Thông tin dùng để liên hệ khi giao hàng."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <CheckoutField label="Họ và tên" error={errors.full_name}>
                  <input className={fieldClass(errors.full_name)} name="full_name" value={formData.full_name} onChange={handleInputChange} placeholder="Nguyễn Văn A" />
                </CheckoutField>
                <CheckoutField label="Số điện thoại" error={errors.phone_number}>
                  <input className={fieldClass(errors.phone_number)} name="phone_number" value={formData.phone_number} onChange={handleInputChange} placeholder="09xxxxxxxx" />
                </CheckoutField>
                <div className="md:col-span-2">
                  <CheckoutField label="Email" error={errors.email}>
                    <input type="email" className={fieldClass(errors.email)} name="email" value={formData.email} onChange={handleInputChange} placeholder="email@example.com" />
                  </CheckoutField>
                </div>
              </div>
            </CheckoutSection>

            <CheckoutSection
              icon={MapPin}
              step="02"
              title="Địa chỉ giao hàng"
              description="Chọn địa chỉ chính xác để đơn hàng đến đúng nơi."
            >
              <div className="space-y-5">
                <CheckoutField label="Số nhà và tên đường" error={errors.address}>
                  <input className={fieldClass(errors.address)} name="address" value={formData.address} onChange={handleInputChange} placeholder="Ví dụ: 123 Nguyễn Huệ" />
                </CheckoutField>

                <div className="grid gap-4 md:grid-cols-3">
                  <CheckoutField label="Tỉnh / Thành phố" error={errors.province}>
                    <select className={fieldClass(errors.province)} name="province" value={formData.province} onChange={handleInputChange}>
                      <option value="">Chọn tỉnh / thành</option>
                      {provinces.map((item) => <option key={item.code} value={item.name}>{item.name}</option>)}
                    </select>
                  </CheckoutField>
                  <CheckoutField label="Quận / Huyện" error={errors.district}>
                    <select className={fieldClass(errors.district)} name="district" value={formData.district} onChange={handleInputChange} disabled={!districts.length}>
                      <option value="">Chọn quận / huyện</option>
                      {districts.map((item) => <option key={item.code} value={item.name}>{item.name}</option>)}
                    </select>
                  </CheckoutField>
                  <CheckoutField label="Phường / Xã" error={errors.ward}>
                    <select className={fieldClass(errors.ward)} name="ward" value={formData.ward} onChange={handleInputChange} disabled={!wards.length}>
                      <option value="">Chọn phường / xã</option>
                      {wards.map((item) => <option key={item.code} value={item.name}>{item.name}</option>)}
                    </select>
                  </CheckoutField>
                </div>

                <CheckoutField label="Ghi chú đơn hàng" optional>
                  <textarea className={`${fieldClass()} min-h-28 resize-none`} name="note" value={formData.note} onChange={handleInputChange} placeholder="Lời nhắn cho đơn vị giao hàng..." />
                </CheckoutField>
              </div>
            </CheckoutSection>

            <CheckoutSection
              icon={CreditCard}
              step="03"
              title="Phương thức thanh toán"
              description="Mọi giao dịch trực tuyến đều được bảo mật."
            >
              {paymentMethods.length === 0 ? (
                <div className="flex items-center gap-3 rounded-2xl bg-stone-50 p-5 text-sm text-stone-500">
                  <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
                  Đang tải phương thức thanh toán...
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {paymentMethods.map((pm) => {
                    const selected = paymentMethod === pm.id;
                    return (
                      <label key={pm.id} className={`relative flex cursor-pointer gap-4 rounded-2xl border p-5 transition ${selected ? 'border-violet-500 bg-violet-50 ring-4 ring-violet-50' : 'border-stone-200 hover:border-stone-300'}`}>
                        <input className="sr-only" type="radio" name="payment" checked={selected} onChange={() => setPaymentMethod(pm.id)} />
                        <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${selected ? 'bg-violet-600 text-white' : 'bg-stone-100 text-stone-500'}`}>
                          {pm.id === 2 ? <WalletCards className="h-5 w-5" /> : <PackageCheck className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-stone-900">{pm.name}</p>
                          <p className="mt-1 text-xs leading-5 text-stone-500">{pm.id === 2 ? 'Thanh toán an toàn qua VNPay' : 'Thanh toán khi nhận được hàng'}</p>
                        </div>
                        {selected && <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-white"><Check className="h-3 w-3" /></span>}
                      </label>
                    );
                  })}
                </div>
              )}
            </CheckoutSection>
          </div>

          <aside className="h-fit overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-xl lg:sticky lg:top-24">
            <div className="border-b border-stone-100 bg-stone-950 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/45">Tóm tắt</p>
                  <h2 className="mt-1 text-xl font-black">Đơn hàng của bạn</h2>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{cartItems.length} sản phẩm</span>
              </div>
            </div>

            <div className="max-h-[360px] space-y-4 overflow-y-auto p-6">
              {cartItems.map((item) => {
                const image = item.imageUrl
                  ? (item.imageUrl.startsWith('http') || item.imageUrl.startsWith('/') ? item.imageUrl : getProductImageUrl(item.imageUrl))
                  : '/placeholder.jpg';
                return (
                  <div key={item.productVariantId || item.id} className="flex gap-3">
                    <div className="relative h-16 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-stone-100">
                      <img src={image} alt={item.name} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }} />
                      <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-900 px-1 text-[10px] font-bold text-white">{item.quantity}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-bold text-stone-800">{item.name}</p>
                      <p className="mt-1 text-xs text-stone-500">{item.selectedColor || '—'} / {item.selectedSize || '—'}</p>
                    </div>
                    <p className="whitespace-nowrap text-sm font-bold text-stone-900">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-stone-100 p-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-stone-500"><span>Tạm tính</span><span className="font-semibold text-stone-800">{formatCurrency(cartTotal)}</span></div>
                <div className="flex justify-between text-stone-500"><span>Phí vận chuyển</span><span className="font-semibold text-emerald-600">Miễn phí</span></div>
              </div>
              <div className="mt-5 flex items-end justify-between border-t border-dashed border-stone-200 pt-5">
                <span className="font-bold text-stone-900">Tổng thanh toán</span>
                <span className="text-2xl font-black text-stone-950">{formatCurrency(cartTotal)}</span>
              </div>

              <button type="button" disabled={loading || cartItems.length === 0} onClick={handleSubmit} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-4 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-stone-400 disabled:shadow-none">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
                {loading ? 'Đang xử lý đơn hàng...' : paymentMethod === 2 ? 'Thanh toán qua VNPay' : 'Đặt hàng ngay'}
              </button>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <TrustItem icon={ShieldCheck} text="Thanh toán bảo mật" />
                <TrustItem icon={Truck} text="Giao hàng miễn phí" />
              </div>
            </div>
          </aside>
        </div>
      </section>
    </MainLayout>
  );
}

function CheckoutSteps() {
  return (
    <div className="flex items-center justify-center gap-2 overflow-x-auto rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm sm:gap-5">
      <Step label="Giỏ hàng" complete />
      <ChevronRight className="h-4 w-4 flex-shrink-0 text-stone-300" />
      <Step label="Thông tin" active />
      <ChevronRight className="h-4 w-4 flex-shrink-0 text-stone-300" />
      <Step label="Hoàn tất" />
    </div>
  );
}

function Step({ label, active, complete }) {
  return (
    <div className={`flex flex-shrink-0 items-center gap-2 text-xs font-bold sm:text-sm ${active ? 'text-violet-700' : complete ? 'text-emerald-600' : 'text-stone-400'}`}>
      <span className={`flex h-7 w-7 items-center justify-center rounded-full ${active ? 'bg-violet-100' : complete ? 'bg-emerald-100' : 'bg-stone-100'}`}>
        {complete ? <Check className="h-4 w-4" /> : active ? '2' : '3'}
      </span>
      {label}
    </div>
  );
}

function CheckoutSection({ icon: Icon, step, title, description, children }) {
  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6 flex items-start gap-4 border-b border-stone-100 pb-5">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700"><Icon className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black text-stone-900">{title}</h2>
            <span className="text-xs font-black text-stone-300">{step}</span>
          </div>
          <p className="mt-1 text-sm text-stone-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function CheckoutField({ label, error, optional, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-stone-700">
        {label} {optional ? <span className="font-normal text-stone-400">(không bắt buộc)</span> : null}
      </label>
      {children}
      {error ? <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p> : null}
    </div>
  );
}

function fieldClass(error) {
  return `w-full rounded-2xl border bg-stone-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 ${
    error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-stone-200 focus:border-violet-400 focus:ring-violet-100'
  }`;
}

function TrustItem({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-stone-50 p-3 text-[11px] font-semibold text-stone-500">
      <Icon className="h-4 w-4 flex-shrink-0 text-emerald-600" />
      {text}
    </div>
  );
}
