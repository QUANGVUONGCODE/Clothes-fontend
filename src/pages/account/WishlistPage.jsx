import MainLayout from '../../layouts/MainLayout';
import { useShop } from '../../context/ShopContext';
import ProductCard from '../../components/product/ProductCard';

export default function WishlistPage() {
  const { wishlistProducts } = useShop();

  return (
    <MainLayout>
      <section className="container-shell py-8">
        <h1 className="text-4xl font-bold">Sản phẩm yêu thích</h1>
        {wishlistProducts.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-brand-100 p-10 text-center">Bạn chưa thêm sản phẩm nào vào danh sách yêu thích.</div>
        ) : (
          <div className="product-grid mt-8">{wishlistProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        )}
      </section>
    </MainLayout>
  );
}
