import MainLayout from '../../layouts/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { toast } from "sonner";
import {
  Gift,
  Mail,
  MapPin,
  Package,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';

import OrderHistory from './OrderHistory';
import InvoiceModal from '../../components/order/InvoiceModal';

// ====================== REVIEW MODAL (TẠO MỚI & CHỈNH SỬA) ======================
const ReviewModal = ({ item, reviewData = null, isEdit = false, onClose }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(reviewData?.rating || 5);
  const [comment, setComment] = useState(reviewData?.comment || '');
  const [selectedTags, setSelectedTags] = useState(reviewData?.tags || []);
  const [submitting, setSubmitting] = useState(false);

  const sampleTags = [
    "Chất liệu tốt", "Thoáng mát", "Mềm mại", "Đúng size", "Màu sắc đẹp",
    "Giá trị tốt", "Giao hàng nhanh", "Thiết kế hiện đại", "Bền đẹp",
    "Dễ phối đồ", "Chất vải cao cấp", "Co giãn tốt"
  ];

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const token = localStorage.getItem('auth_token');

    const payload = {
      user_id: user?.id || item.order?.user?.id,
      product_id: item.product_variant?.product?.id,
      order_id: item.order?.id,
      orderDetail_id: item.id,
      product_variant_id: item.product_variant?.id,
      rating: rating,
      comment: comment.trim(),
      tags: selectedTags
    };

    const url = isEdit && reviewData?.id
      ? `/shopclothes/api/v1/reviews/${reviewData.id}`
      : `/shopclothes/api/v1/reviews`;

    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.code === 0) {
        toast.success(isEdit ? '✅ Cập nhật đánh giá thành công!' : '✅ Đánh giá thành công! Cảm ơn bạn ❤️');
        onClose();
      } else {
        toast.error(data?.message || 'Thao tác thất bại');
      }
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-2xl font-bold">{isEdit ? 'Chỉnh sửa đánh giá' : 'Đánh giá sản phẩm'}</h2>
          <button onClick={onClose} className="text-3xl text-stone-400 hover:text-stone-600">×</button>
        </div>

        {/* Sản phẩm */}
        <div className="flex gap-4 border-b px-6 py-5">
          <img
            src={item.product_variant?.product?.thumbnail
              ? `/shopclothes/api/v1/product-images/images/${item.product_variant.product.thumbnail}`
              : '/placeholder.jpg'}
            alt={item.product_variant?.product?.name}
            className="h-20 w-20 rounded-2xl object-cover"
          />
          <div className="flex-1">
            <h4 className="font-semibold">{item.product_variant?.product?.name}</h4>
            <p className="text-sm text-stone-500">
              {item.product_variant?.color?.name} • {item.product_variant?.size?.name}
            </p>
          </div>
        </div>

        {/* Rating */}
        <div className="px-6 py-6 text-center">
          <p className="mb-3 text-sm font-medium text-stone-500">Bạn đánh giá sản phẩm này bao nhiêu sao?</p>
          <div className="flex justify-center gap-1 text-6xl">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`transition-all hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-stone-200'}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="px-6 pb-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Nhận xét của bạn (có thể để trống)..."
            className="w-full h-28 rounded-2xl border border-stone-200 p-4 focus:border-brand-300 focus:outline-none resize-none"
          />
        </div>

        {/* Tags */}
        <div className="px-6">
          <p className="mb-3 text-sm font-medium text-stone-500">Chọn tag phù hợp (có thể chọn nhiều)</p>
          <div className="flex flex-wrap gap-2 pb-6">
            {sampleTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`rounded-3xl px-4 py-1 text-sm transition-all ${
                  selectedTags.includes(tag)
                    ? 'bg-brand-600 text-white'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="px-6 pb-6">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-3xl bg-gradient-to-r from-brand-600 to-violet-600 py-4 text-base font-semibold text-white disabled:opacity-70"
          >
            {submitting ? 'Đang xử lý...' : isEdit ? 'Cập nhật đánh giá' : 'Gửi đánh giá ngay'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ====================== XEM ĐÁNH GIÁ MODAL ======================
const ViewReviewModal = ({ item, onClose, onReviewUpdated }) => {
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(
          `/shopclothes/api/v1/reviews/one?order_detail_id=${item.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();

        if (data.code === 0 && data.result) {
          setReview(data.result);
        } else {
          toast.error('Chưa có đánh giá nào cho sản phẩm này.');
          onClose();
        }
      } catch (error) {
        console.error(error);
        toast.error('Lỗi khi tải đánh giá');
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [item]);

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này không?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/shopclothes/api/v1/reviews/${review.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success('✅ Đã xóa đánh giá thành công');
        onReviewUpdated?.();
        onClose();
      } else {
        toast.error('Xóa đánh giá thất bại');
      }
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
        <div className="rounded-3xl bg-white px-8 py-6">Đang tải đánh giá...</div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
        <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-2xl font-bold">Đánh giá của bạn</h2>
            <button onClick={onClose} className="text-3xl text-stone-400 hover:text-stone-600">×</button>
          </div>

          <div className="px-6 py-6">
            <div className="flex gap-4">
              <img
                src={item.product_variant?.product?.thumbnail
                  ? `/shopclothes/api/v1/product-images/images/${item.product_variant.product.thumbnail}`
                  : '/placeholder.jpg'}
                alt=""
                className="h-20 w-20 rounded-2xl object-cover"
              />
              <div>
                <h4 className="font-semibold">{item.product_variant?.product?.name}</h4>
                <p className="text-sm text-stone-500">
                  {item.product_variant?.color?.name} • {item.product_variant?.size?.name}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-center text-5xl text-yellow-400">
              {'★'.repeat(review?.rating || 5)}
              <span className="text-stone-200">{'★'.repeat(5 - (review?.rating || 5))}</span>
            </div>

            {review?.comment && (
              <div className="mt-6 rounded-2xl bg-stone-50 p-5">
                <p className="italic text-stone-700">“{review.comment}”</p>
              </div>
            )}

            {review?.tags && review.tags.length > 0 && (
              <div className="mt-6">
                <p className="mb-3 text-sm font-medium text-stone-500">Tag đã chọn</p>
                <div className="flex flex-wrap gap-2">
                  {review.tags.map((tag, index) => (
                    <span key={index} className="rounded-3xl bg-brand-100 px-4 py-1 text-sm text-brand-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex-1 rounded-2xl border border-brand-200 py-3.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
              >
                ✏️ Chỉnh sửa
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-2xl border border-red-200 py-3.5 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                🗑️ Xóa đánh giá
              </button>
            </div>
          </div>

          <div className="px-6 py-6">
            <button onClick={onClose} className="w-full rounded-3xl border border-stone-300 py-4 text-base font-semibold">
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Modal chỉnh sửa */}
      {showEditModal && review && (
        <ReviewModal
          item={item}
          reviewData={review}
          isEdit={true}
          onClose={() => {
            setShowEditModal(false);
            onReviewUpdated?.();
          }}
        />
      )}
    </>
  );
};

// ====================== ORDER DETAIL MODAL ======================
const OrderDetailModal = ({ order, onClose }) => {
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderInfo, setOrderInfo] = useState(order);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showViewReviewModal, setShowViewReviewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (!order?.id) return;

    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(
          `/shopclothes/api/v1/order-details/orders/${order.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();

        if (data.code === 0 && data.result?.length > 0) {
          setOrderDetails(data.result);
          setOrderInfo((currentOrder) => ({
            ...currentOrder,
            ...(data.result[0].order || {}),
          }));
        }
      } catch (error) {
        console.error('Lỗi lấy chi tiết đơn hàng:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [order]);

  const normalizedOrderStatus =
    orderInfo?.status === 'DELIVERED' ? 'COMPLETED' : orderInfo?.status;
  const canShowReview = normalizedOrderStatus === 'COMPLETED';

  const handleReviewClick = (item) => {
    setSelectedItem(item);
    setShowReviewModal(true);
  };

  const handleViewReviewClick = (item) => {
    setSelectedItem(item);
    setShowViewReviewModal(true);
  };

  const handleReviewUpdated = () => {
    // Có thể reload modal chi tiết nếu cần
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="rounded-3xl bg-white px-8 py-6 text-lg">Đang tải chi tiết đơn hàng...</div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
          <div className="mb-6 flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold">Chi tiết đơn hàng</h2>
              {orderInfo && (
                <p className="mt-1 font-mono text-sm text-stone-500">
                  {orderInfo.orderCode ?? orderInfo.order_code}
                </p>
              )}
            </div>
            <button onClick={onClose} className="text-3xl leading-none text-stone-400 hover:text-stone-600">×</button>
          </div>

          {orderInfo && (
            <div className="mb-6 rounded-2xl bg-brand-50 p-5 text-sm">
              <div className="grid grid-cols-2 gap-y-3">
                <div>Ngày đặt: <span className="font-medium">{new Date(orderInfo.orderDate ?? orderInfo.order_date).toLocaleDateString('vi-VN')}</span></div>
                <div className="text-right">
                  Trạng thái:{' '}
                  <span className={`inline-block rounded-full px-4 py-1 text-xs font-semibold ${normalizedOrderStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' : normalizedOrderStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                    {normalizedOrderStatus}
                  </span>
                </div>
                <div>Thanh toán: <span className="font-medium">{orderInfo.payment?.name ?? orderInfo.paymentMethod ?? orderInfo.payment_method}</span></div>
                <div className="text-right text-lg font-semibold">Tổng tiền: {(orderInfo.totalMoney ?? orderInfo.total_money)?.toLocaleString('vi-VN')}đ</div>
              </div>
            </div>
          )}

          <div className="max-h-[420px] space-y-4 overflow-y-auto pr-2">
            {orderDetails.map((item) => {
              const pv = item.product_variant;
              const product = pv.product;
              const thumbnail = product?.thumbnail;

              return (
                <div key={item.id} className="flex gap-5 rounded-2xl border border-brand-100 p-5">
                  <img
                    src={thumbnail ? `/shopclothes/api/v1/product-images/images/${thumbnail}` : '/placeholder.jpg'}
                    alt={product?.name}
                    className="h-24 w-24 flex-shrink-0 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold leading-tight">{product?.name}</h4>
                    <p className="mt-1 text-sm text-stone-500">
                      {pv.color?.name} • {pv.size?.name} • SL: {item.quantity}
                    </p>
                    <p className="mt-2 font-medium text-lg">{item.price?.toLocaleString('vi-VN')}đ</p>

                    {canShowReview && (
                      <div className="mt-4">
                        {item.active === true ? (
                          <button onClick={() => handleViewReviewClick(item)} className="rounded-2xl border border-brand-200 px-6 py-2.5 text-sm font-medium hover:bg-brand-50">
                            Xem đánh giá
                          </button>
                        ) : (
                          <button onClick={() => handleReviewClick(item)} className="btn-primary text-sm px-6 py-2.5">
                            Đánh giá sản phẩm
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={onClose} className="btn-outline px-8">Đóng</button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedItem && (
        <ReviewModal
          item={selectedItem}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedItem(null);
          }}
        />
      )}

      {/* View Review Modal */}
      {showViewReviewModal && selectedItem && (
        <ViewReviewModal
          item={selectedItem}
          onClose={() => {
            setShowViewReviewModal(false);
            setSelectedItem(null);
          }}
          onReviewUpdated={handleReviewUpdated}
        />
      )}
    </>
  );
};

export default function AccountPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceOrderCode, setInvoiceOrderCode] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    address: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user?.full_name || '',
        email: user?.email || '',
        phone_number: user?.phone_number || '',
        address: user?.address || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async () => {
    try {
      setSavingProfile(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/shopclothes/api/v1/users/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data?.code === 0) {
        localStorage.setItem('user_response', JSON.stringify(data.result));
        toast.success('Cập nhật thông tin thành công');
        window.location.reload();
      } else {
        toast.error(data?.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setSavingProfile(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
            <div className="relative overflow-hidden bg-gradient-to-br from-stone-950 via-stone-900 to-violet-950 px-6 py-8 text-white sm:px-8">
              <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-3xl border border-white/15 bg-white/10 text-3xl font-black uppercase shadow-xl backdrop-blur">
                  {formData.full_name?.trim()?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Tài khoản đã xác thực
                  </span>
                  <h2 className="mt-3 truncate text-2xl font-black sm:text-3xl">
                    {formData.full_name || 'Thành viên NovaWear'}
                  </h2>
                  <p className="mt-1 truncate text-sm text-white/55">{formData.email || 'Chưa có email'}</p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="mb-7 flex flex-col gap-2 border-b border-stone-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">Hồ sơ cá nhân</p>
                  <h3 className="mt-2 text-2xl font-black text-stone-900">Thông tin liên hệ</h3>
                  <p className="mt-1 text-sm text-stone-500">Thông tin được dùng cho việc giao hàng và liên hệ.</p>
                </div>
                <span className="text-xs text-stone-400">ID thành viên: #{user?.id ?? '—'}</span>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <ProfileField icon={UserRound} label="Họ và tên" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Nhập họ và tên" />
                <ProfileField icon={Phone} label="Số điện thoại" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="Nhập số điện thoại" />
                <div className="md:col-span-2">
                  <ProfileField icon={Mail} label="Địa chỉ email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Nhập email" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-stone-700">
                    <MapPin className="h-4 w-4 text-violet-600" />
                    Địa chỉ mặc định
                  </label>
                  <textarea
                    className="min-h-32 w-full resize-none rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Nhập địa chỉ nhận hàng mặc định"
                  />
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-3 border-t border-stone-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-stone-400">Dữ liệu cá nhân chỉ được dùng để xử lý đơn hàng.</p>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={handleUpdateProfile}
                  disabled={savingProfile}
                >
                  <Save className={`h-4 w-4 ${savingProfile ? 'animate-pulse' : ''}`} />
                  {savingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </div>
        );

      case 'orders':
        return (
          <OrderHistory
            onViewOrderDetail={setSelectedOrder}
            onViewInvoice={setInvoiceOrderCode}
          />
        );

      case 'promotions':
        return (
          <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
            <div className="bg-gradient-to-br from-violet-700 to-indigo-900 p-8 text-white">
              <Gift className="h-9 w-9 text-violet-200" />
              <h2 className="mt-5 text-3xl font-black">Ưu đãi của tôi</h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-white/65">Voucher và quyền lợi thành viên sẽ được lưu tại đây.</p>
            </div>
            <div className="p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50">
                <Sparkles className="h-8 w-8 text-violet-500" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-stone-900">Chưa có ưu đãi mới</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-stone-500">Các chương trình phù hợp với tài khoản của bạn sẽ xuất hiện tại đây.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <section className="container-shell py-8 sm:py-10">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-600">NovaWear Member</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">Tài khoản cá nhân</h1>
          <p className="mt-2 text-sm text-stone-500">Quản lý hồ sơ, đơn hàng và quyền lợi thành viên.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start">
          <aside className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-sm lg:sticky lg:top-24">
            <div className="border-b border-stone-100 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-900 font-black uppercase text-white">
                  {formData.full_name?.trim()?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-stone-900">{formData.full_name || 'Thành viên'}</p>
                  <p className="truncate text-xs text-stone-400">{formData.email || 'NovaWear Member'}</p>
                </div>
              </div>
            </div>
            <nav className="grid grid-cols-3 gap-1 p-2 lg:block lg:space-y-1">
              <AccountNavButton icon={UserRound} label="Hồ sơ" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
              <AccountNavButton icon={Package} label="Đơn hàng" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
              <AccountNavButton icon={Gift} label="Ưu đãi" active={activeTab === 'promotions'} onClick={() => setActiveTab('promotions')} />
            </nav>
          </aside>

          <div className="min-w-0">{renderContent()}</div>
        </div>
      </section>

      {/* MODAL CHI TIẾT ĐƠN HÀNG */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
      {invoiceOrderCode && (
        <InvoiceModal
          orderCode={invoiceOrderCode}
          onClose={() => setInvoiceOrderCode(null)}
        />
      )}
    </MainLayout>
  );
}

function AccountNavButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full flex-col items-center justify-center gap-1.5 rounded-2xl px-3 py-3 text-xs font-bold transition lg:flex-row lg:justify-start lg:gap-3 lg:px-4 lg:text-sm ${
        active
          ? 'bg-stone-900 text-white shadow-md'
          : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function ProfileField({ icon: Icon, label, ...inputProps }) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-bold text-stone-700">
        <Icon className="h-4 w-4 text-violet-600" />
        {label}
      </label>
      <input
        {...inputProps}
        className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
      />
    </div>
  );
}
