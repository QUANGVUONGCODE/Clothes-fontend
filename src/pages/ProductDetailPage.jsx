import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getProductImageUrl,
  getProductVariantsByProductId,
  getProductImagesByProductIdAndColorId,
} from "../services/productService";
import { useShop } from "../context/ShopContext";
import { toast } from "sonner";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80";

function ProductDetailPage() {
  const { id } = useParams();
  const productId = Number(id);
  const { addToCart } = useShop();

  const [variants, setVariants] = useState([]);
  const [product, setProduct] = useState(null);

  const [selectedColorId, setSelectedColorId] = useState(null);
  const [selectedSizeId, setSelectedSizeId] = useState(null);

  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  // ==================== ĐÁNH GIÁ ====================
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingImages, setLoadingImages] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Fetch product variants
  useEffect(() => {
    if (!productId || Number.isNaN(productId)) return;

    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const variantData = await getProductVariantsByProductId(productId);
        const safeVariants = Array.isArray(variantData) ? variantData : [];

        setVariants(safeVariants);
        setProduct(safeVariants[0]?.product || null);

        if (safeVariants.length > 0) {
          const first = safeVariants[0];
          setSelectedColorId(first?.color?.id ?? null);
          setSelectedSizeId(first?.size?.id ?? null);
        }
      } catch (error) {
        console.error("Lỗi lấy chi tiết sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [productId]);

  // Fetch images by color
  useEffect(() => {
    if (!productId || selectedColorId === null) {
      setImages([]);
      setSelectedImage(null);
      return;
    }

    const fetchImagesByColor = async () => {
      try {
        setLoadingImages(true);
        const imageData = await getProductImagesByProductIdAndColorId(productId, selectedColorId);
        const safeImages = Array.isArray(imageData) ? imageData : [];
        setImages(safeImages);
        setSelectedImage(safeImages.find((img) => img.isMain === true) || safeImages[0] || null);
      } catch (error) {
        console.error("Lỗi lấy ảnh:", error);
      } finally {
        setLoadingImages(false);
      }
    };

    fetchImagesByColor();
  }, [productId, selectedColorId]);

  // Fetch reviews
  useEffect(() => {
    if (!productId) return;

    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        const res = await fetch(
          `/shopclothes/api/v1/reviews/all?product_id=${productId}&page=0&limit=10`
        );
        const data = await res.json();

        if (data.code === 0 && data.result?.reviews) {
          setReviews(data.result.reviews);
        }
      } catch (error) {
        console.error("Lỗi lấy đánh giá:", error);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [productId]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const colors = useMemo(() => {
    const map = new Map();
    variants.forEach((v) => {
      const color = v?.color;
      if (color && !map.has(color.id)) map.set(color.id, color);
    });
    return Array.from(map.values());
  }, [variants]);

  const sizes = useMemo(() => {
    const filtered = selectedColorId !== null
      ? variants.filter((v) => v.color?.id === selectedColorId)
      : variants;

    const map = new Map();
    filtered.forEach((v) => {
      const size = v?.size;
      if (size && !map.has(size.id)) map.set(size.id, size);
    });
    return Array.from(map.values()).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [variants, selectedColorId]);

  const selectedVariant = useMemo(() => {
    return variants.find(
      (v) => v.color?.id === selectedColorId && v.size?.id === selectedSizeId
    ) || null;
  }, [variants, selectedColorId, selectedSizeId]);

  // Quantity handlers
  const handleDecreaseQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));
  const handleIncreaseQuantity = () => {
    const max = selectedVariant?.stockQuantity || 1;
    setQuantity((prev) => Math.min(max, prev + 1));
  };

  const handleQuantityChange = (e) => {
    const value = Number(e.target.value);
    if (Number.isNaN(value) || value < 1) {
      setQuantity(1);
      return;
    }
    const max = selectedVariant?.stockQuantity || 1;
    setQuantity(Math.min(value, max));
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Vui lòng chọn màu và size");
      return;
    }
    if (selectedVariant.stockQuantity <= 0) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }

    const productData = {
      id: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      imageUrl: product.thumbnail,
    };

    addToCart(productData, quantity, selectedVariant.color?.name, selectedVariant.size?.name, selectedVariant.id);
    setQuantity(1);
    toast.success("Đã thêm vào giỏ hàng");
  };

  const handleBuyNow = () => {
    if (!selectedVariant) {
      toast.error("Vui lòng chọn màu và size");
      return;
    }
    toast.info("Chức năng mua ngay đang phát triển...");
  };

  if (loading) return <div className="mx-auto max-w-[1280px] px-4 py-10">Đang tải...</div>;
  if (!product) return <div className="mx-auto max-w-[1280px] px-4 py-10 text-center">Không tìm thấy sản phẩm</div>;

  const displayImageUrl = selectedImage?.imageUrl
    ? getProductImageUrl(selectedImage.imageUrl)
    : product.thumbnail
    ? getProductImageUrl(product.thumbnail)
    : FALLBACK_IMAGE;

  const price = product.salePrice ?? product.price;
  const originalPrice = product.discountPercent > 0 ? product.price : null;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 lg:px-6">
      {/* ==================== PHẦN SẢN PHẨM ==================== */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[90px_minmax(0,520px)_1fr]">
        {/* Thumbnail sidebar */}
        <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col">
          {loadingImages ? (
            <div className="text-sm text-stone-400">Đang tải ảnh...</div>
          ) : images.length > 0 ? (
            images.map((img) => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(img)}
                className={`overflow-hidden rounded-xl border-2 ${
                  selectedImage?.id === img.id ? "border-stone-900" : "border-stone-200"
                }`}
              >
                <img
                  src={getProductImageUrl(img.imageUrl) || FALLBACK_IMAGE}
                  alt={product.name}
                  className="h-20 w-16 object-cover"
                />
              </button>
            ))
          ) : (
            <div className="text-sm text-stone-400">Không có ảnh</div>
          )}
        </div>

        {/* Main image */}
        <div className="order-1 overflow-hidden rounded-2xl bg-stone-100 lg:order-2">
          <img
            src={displayImageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Product info */}
        <div className="order-3">
          <p className="mb-2 text-sm text-stone-500">
            {product.subCategory?.category?.department?.name} /{" "}
            {product.subCategory?.category?.name} / {product.subCategory?.name}
          </p>

          <h1 className="text-3xl font-bold text-stone-900">{product.name}</h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-bold text-stone-900">
              {Number(price).toLocaleString("vi-VN")}đ
            </span>
            {originalPrice && (
              <span className="text-lg text-stone-400 line-through">
                {Number(originalPrice).toLocaleString("vi-VN")}đ
              </span>
            )}
          </div>

          <p className="mt-4 text-sm leading-6 text-stone-600">
            {product.shortDescription || product.description}
          </p>

          {/* Màu sắc */}
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-bold uppercase text-stone-700">Màu sắc</h3>
            <div className="flex flex-wrap gap-3">
              {colors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColorId(color.id)}
                  className={`h-10 w-10 rounded-full border-2 ${
                    selectedColorId === color.id ? "border-blue-600" : "border-stone-300"
                  }`}
                  style={{ backgroundColor: color.code || "#ddd" }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Kích thước */}
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-bold uppercase text-stone-700">Kích thước</h3>
            <div className="flex flex-wrap gap-3">
              {sizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSelectedSizeId(size.id)}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium ${
                    selectedSizeId === size.id
                      ? "border-blue-600 text-blue-600"
                      : "border-stone-300 text-stone-700"
                  }`}
                >
                  {size.name}
                </button>
              ))}
            </div>
          </div>

          {/* Số lượng */}
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-bold uppercase text-stone-700">Số lượng</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center overflow-hidden rounded-xl border border-stone-300">
                <button onClick={handleDecreaseQuantity} className="flex h-10 w-10 items-center justify-center hover:bg-stone-100">-</button>
                <input
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-14 text-center outline-none"
                />
                <button onClick={handleIncreaseQuantity} className="flex h-10 w-10 items-center justify-center hover:bg-stone-100">+</button>
              </div>
              <span className="text-sm text-stone-500">
                Còn {selectedVariant?.stockQuantity ?? 0} sản phẩm
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant || selectedVariant.stockQuantity <= 0}
              className={`flex-1 rounded-xl py-3.5 text-white ${
                !selectedVariant || selectedVariant.stockQuantity <= 0
                  ? "bg-stone-400"
                  : "bg-stone-900 hover:bg-stone-800"
              }`}
            >
              Thêm vào giỏ hàng
            </button>

            <button
              onClick={handleBuyNow}
              disabled={!selectedVariant || selectedVariant.stockQuantity <= 0}
              className={`flex-1 rounded-xl border py-3.5 ${
                !selectedVariant || selectedVariant.stockQuantity <= 0
                  ? "border-stone-200 text-stone-400"
                  : "border-stone-300 text-stone-900 hover:bg-stone-50"
              }`}
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>

      {/* Mô tả */}
      <div className="mt-12">
        <h2 className="mb-4 text-xl font-bold text-stone-900">Mô tả sản phẩm</h2>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="whitespace-pre-line leading-7 text-stone-700">
            {product.description || "Đang cập nhật mô tả sản phẩm."}
          </p>
        </div>
      </div>

      {/* ==================== ĐÁNH GIÁ SẢN PHẨM ==================== */}
     <div className="mt-16">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-2xl font-bold">Đánh giá sản phẩm</h2>
          <div className="flex items-center gap-2">
            <span className="text-3xl text-yellow-400">★★★★☆</span>
            <span className="text-2xl font-semibold">{averageRating}</span>
            <span className="text-stone-500">({reviews.length} đánh giá)</span>
          </div>
        </div>

        {loadingReviews ? (
          <p className="py-12 text-center text-stone-500">Đang tải đánh giá...</p>
        ) : reviews.length === 0 ? (
          <p className="py-12 text-center text-stone-500">Chưa có đánh giá nào cho sản phẩm này.</p>
        ) : (
          <div className="mt-8 space-y-8">
            {reviews.map((review) => {
              const colorName = review.productVariant?.color?.name || "—";
              const sizeName = review.productVariant?.size?.name || "—";

              return (
                <div key={review.id} className="rounded-2xl border border-stone-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-stone-200 flex items-center justify-center text-lg">
                        👤
                      </div>
                      <div>
                        <p className="font-semibold">{review.user?.fullName || "Người dùng"}</p>
                        <p className="text-xs text-stone-500">
                          {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="text-3xl text-yellow-400">
                      {'★'.repeat(review.rating || 0)}
                      <span className="text-stone-200">{'★'.repeat(5 - (review.rating || 0))}</span>
                    </div>
                  </div>

                  {/* Màu + Size */}
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="text-stone-500">Màu:</span>
                      <span className="font-medium">{colorName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-stone-500">Size:</span>
                      <span className="font-medium">{sizeName}</span>
                    </div>
                  </div>

                  {/* Comment */}
                  {review.comment && (
                    <p className="mt-4 italic text-stone-700">“{review.comment}”</p>
                  )}

                  {/* Tags */}
                  {review.tags && review.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {review.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="rounded-3xl bg-brand-100 px-4 py-1 text-xs text-brand-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetailPage;