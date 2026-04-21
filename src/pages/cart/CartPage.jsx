import MainLayout from '../../layouts/MainLayout';
import { useShop } from '../../context/ShopContext';
import { useEffect, useState } from 'react';
import { getProductById } from '../../services/productService';
import { products } from '../../data/products';
import { formatCurrency } from '../../utils/format';
import { Link } from 'react-router-dom';
import { getProductImageUrl } from '../../services/productService';

export default function CartPage() {
  const { cartItems, updateCartItemQuantity, removeFromCart, cartTotal } = useShop();
  const [productImages, setProductImages] = useState({});
  const [imageLoading, setImageLoading] = useState({});

  useEffect(() => {
    const fetchProductImages = async () => {
      const imagePromises = cartItems.map(async (item) => {
        if (!productImages[item.id] && !imageLoading[item.id]) {
          setImageLoading(prev => ({ ...prev, [item.id]: true }));
          try {
            const product = await getProductById(item.id);
            const thumbnail = product?.thumbnail;
            const imgUrl = thumbnail ? getProductImageUrl(thumbnail) : null;
            setProductImages(prev => ({ ...prev, [item.id]: imgUrl }));
          } catch (error) {
            console.error('Lỗi lấy ảnh sản phẩm:', item.id, error);
          } finally {
            setImageLoading(prev => ({ ...prev, [item.id]: false }));
          }
        }
      });
      await Promise.all(imagePromises);
    };

    fetchProductImages();
  }, [cartItems.length]);

  return (
    <MainLayout>
      <section className="container-shell py-8">
        <h1 className="text-4xl font-bold">Giỏ hàng</h1>
        {cartItems.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-brand-100 p-10 text-center">
            Giỏ hàng đang trống. <Link to="/products" className="font-semibold underline">Tiếp tục mua sắm</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} className="grid gap-4 rounded-3xl border border-brand-100 p-4 md:grid-cols-[120px_1fr_auto] md:items-center">
                  <img 
                    src={productImages[item.id] || products.find(p => p.id === item.id)?.images[0] || '/placeholder.jpg'} 
                    alt={item.name} 
                    className="aspect-square rounded-2xl object-cover bg-gray-200"
                    onError={(e) => e.target.src = '/placeholder.jpg'}
                  />
                  <div>
                    <h2 className="font-semibold">{item.name}</h2>
                    <p className="mt-2 text-sm text-brand-500">Màu: {item.selectedColor} · Size: {item.selectedSize}</p>
                    <p className="mt-3 font-bold">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center rounded-full border border-brand-200">
                      <button onClick={() => updateCartItemQuantity(item.productVariantId || item.id, -1)} className="px-4 py-2">-</button>
                      <span className="px-4">{item.quantity}</span>
                      <button onClick={() => updateCartItemQuantity(item.productVariantId || item.id, 1)} className="px-4 py-2">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.productVariantId || item.id)} className="text-sm text-danger">Xóa</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-fit rounded-3xl border border-brand-100 p-6 shadow-card">
              <h2 className="text-xl font-semibold">Tóm tắt đơn hàng</h2>
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between"><span>Tạm tính</span><span>{formatCurrency(cartTotal)}</span></div>
                <div className="flex justify-between"><span>Phí vận chuyển</span><span>Miễn phí</span></div>
              </div>
              <div className="mt-6 flex justify-between border-t border-brand-100 pt-4 font-bold">
                <span>Tổng cộng</span><span>{formatCurrency(cartTotal)}</span>
              </div>
              <Link to="/checkout" className="btn-primary mt-6 w-full">Tiến hành thanh toán</Link>
            </div>
          </div>
        )}
      </section>
    </MainLayout>
  );
}
