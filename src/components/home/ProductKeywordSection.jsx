import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
    getProductImageUrl,
    searchProductsByKeyword,
} from "../../services/productService";

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80";

function ProductKeywordSection({
    title = "SẢN PHẨM NỔI BẬT",
    keyword = "pickleball",
    limit = 10,
    viewMoreLink = "/products",
}) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const sliderRef = useRef(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const result = await searchProductsByKeyword(keyword, limit);
                setProducts(result);
            } catch (error) {
                console.error("Lỗi lấy sản phẩm theo keyword:", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [keyword, limit]);

    const scrollSlider = (direction) => {
        if (!sliderRef.current) return;

        const container = sliderRef.current;
        const card = container.querySelector("[data-product-card]");
        const scrollAmount = card
            ? card.clientWidth + 16
            : Math.floor(container.clientWidth * 0.8);

        container.scrollBy({
            left: direction === "next" ? scrollAmount : -scrollAmount,
            behavior: "smooth",
        });
    };

    return (
        <section className="mx-auto max-w-[1440px] px-4 py-10 lg:px-6">
            <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="text-2xl font-extrabold uppercase text-stone-900">
                    {title}
                </h2>

                <Link
                    to={viewMoreLink}
                    className="text-sm font-semibold text-stone-900 underline hover:text-blue-600"
                >
                    Xem thêm
                </Link>
            </div>

            {loading ? (
                <div className="flex gap-4 overflow-hidden">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="min-w-[280px] flex-shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm"
                        >
                            <div className="aspect-[4/5] animate-pulse bg-stone-200" />
                            <div className="p-3">
                                <div className="mb-2 h-4 w-24 animate-pulse rounded bg-stone-200" />
                                <div className="h-4 w-16 animate-pulse rounded bg-stone-200" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : products.length > 0 ? (
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => scrollSlider("prev")}
                        className="absolute left-[-10px] top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black text-white shadow lg:flex"
                        aria-label="Sang trái"
                    >
                        ←
                    </button>

                    <div
                        ref={sliderRef}
                        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                    >
                        {products.map((product) => {
                            const imageUrl = getProductImageUrl(product.thumbnail);
                            const price = product.salePrice ?? product.price;
                            const originalPrice =
                                product.discountPercent && product.discountPercent > 0 ? product.price : null;

                            return (
                                <Link
                                    key={product.id}
                                    to={`/products/${product.id}`}
                                    data-product-card
                                    className="group min-w-[280px] max-w-[280px] flex-shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                                >
                                    <div className="aspect-[4/5] overflow-hidden bg-stone-100">
                                        <img
                                            src={imageUrl || FALLBACK_IMAGE}
                                            alt={product.name}
                                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                        />
                                    </div>

                                    <div className="p-3">
                                        <h3 className="line-clamp-2 min-h-[48px] text-sm font-medium text-stone-900">
                                            {product.name}
                                        </h3>

                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-base font-bold text-stone-900">
                                                {Number(price).toLocaleString("vi-VN")}đ
                                            </span>

                                            {originalPrice && (
                                                <span className="text-sm text-stone-400 line-through">
                                                    {Number(originalPrice).toLocaleString("vi-VN")}đ
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={() => scrollSlider("next")}
                        className="absolute right-[-10px] top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black text-white shadow lg:flex"
                        aria-label="Sang phải"
                    >
                        →
                    </button>
                </div>
            ) : (
                <div className="rounded-2xl border border-dashed border-stone-300 px-6 py-10 text-center text-stone-500">
                    Không có sản phẩm phù hợp với từ khóa "{keyword}".
                </div>
            )}
        </section>
    );
}

export default ProductKeywordSection;