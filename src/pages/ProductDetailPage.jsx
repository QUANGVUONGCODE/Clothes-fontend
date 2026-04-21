import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getProductImageUrl,
  getProductVariantsByProductId,
  getProductImagesByProductIdAndColorId,
} from "../services/productService";
import { useShop } from "../context/ShopContext";

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

  const [loading, setLoading] = useState(true);
  const [loadingImages, setLoadingImages] = useState(false);
  const [quantity, setQuantity] = useState(1);

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
          const firstVariant = safeVariants[0];
          setSelectedColorId(firstVariant?.color?.id ?? null);
          setSelectedSizeId(firstVariant?.size?.id ?? null);
        } else {
          setSelectedColorId(null);
          setSelectedSizeId(null);
        }
      } catch (error) {
        console.error("Lỗi lấy chi tiết sản phẩm:", error);
        setVariants([]);
        setProduct(null);
        setSelectedColorId(null);
        setSelectedSizeId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [productId]);

  useEffect(() => {
    if (!productId || selectedColorId === null) {
      setImages([]);
      setSelectedImage(null);
      return;
    }

    const fetchImagesByColor = async () => {
      try {
        setLoadingImages(true);

        const imageData = await getProductImagesByProductIdAndColorId(
          productId,
          selectedColorId
        );

        const safeImages = Array.isArray(imageData) ? imageData : [];
        setImages(safeImages);

        const mainImage =
          safeImages.find((img) => img.isMain === true) || safeImages[0] || null;

        setSelectedImage(mainImage);
      } catch (error) {
        console.error("Lỗi lấy ảnh theo màu:", error);
        setImages([]);
        setSelectedImage(null);
      } finally {
        setLoadingImages(false);
      }
    };

    fetchImagesByColor();
  }, [productId, selectedColorId]);

  const colors = useMemo(() => {
    const map = new Map();

    variants.forEach((variant) => {
      const color = variant?.color;
      if (color && !map.has(color.id)) {
        map.set(color.id, color);
      }
    });

    return Array.from(map.values());
  }, [variants]);

  const sizes = useMemo(() => {
    const filteredVariants =
      selectedColorId !== null
        ? variants.filter((variant) => variant.color?.id === selectedColorId)
        : variants;

    const map = new Map();

    filteredVariants.forEach((variant) => {
      const size = variant?.size;
      if (size && !map.has(size.id)) {
        map.set(size.id, size);
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
    );
  }, [variants, selectedColorId]);

  const selectedVariant = useMemo(() => {
    return (
      variants.find(
        (variant) =>
          variant.color?.id === selectedColorId &&
          variant.size?.id === selectedSizeId
      ) || null
    );
  }, [variants, selectedColorId, selectedSizeId]);

  useEffect(() => {
    if (selectedColorId === null) return;

    const matchedVariant = variants.find(
      (variant) => variant.color?.id === selectedColorId
    );

    const currentSizeStillValid = variants.some(
      (variant) =>
        variant.color?.id === selectedColorId &&
        variant.size?.id === selectedSizeId
    );

    if (matchedVariant && !currentSizeStillValid) {
      setSelectedSizeId(matchedVariant.size?.id ?? null);
    }
  }, [selectedColorId, selectedSizeId, variants]);

  useEffect(() => {
    setQuantity(1);
  }, [selectedColorId, selectedSizeId]);

  const handleDecreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncreaseQuantity = () => {
    const maxStock = selectedVariant?.stockQuantity || 1;
    setQuantity((prev) => Math.min(maxStock, prev + 1));
  };

  const handleQuantityChange = (e) => {
    const value = Number(e.target.value);

    if (Number.isNaN(value) || value < 1) {
      setQuantity(1);
      return;
    }

    const maxStock = selectedVariant?.stockQuantity || 1;
    setQuantity(Math.min(value, maxStock));
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      alert("Vui lòng chọn màu và size");
      return;
    }

    if ((selectedVariant.stockQuantity || 0) <= 0) {
      alert("Sản phẩm đã hết hàng");
      return;
    }

    const productData = {
      id: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      imageUrl: product.thumbnail,
    };

    addToCart(productData, quantity, selectedVariant.color?.name, selectedVariant.size?.name, selectedVariant.id);
    
    setQuantity(1); // Reset quantity
    
    // Success toast/UX feedback can be added here
  };

  const handleBuyNow = () => {
    if (!selectedVariant) {
      alert("Vui lòng chọn màu và size");
      return;
    }

    if ((selectedVariant.stockQuantity || 0) <= 0) {
      alert("Sản phẩm đã hết hàng");
      return;
    }

    const payload = {
      productId: product.id,
      productVariantId: selectedVariant.id,
      quantity,
    };

    console.log("BUY NOW =", payload);

    // TODO:
    // 1) gọi add to cart / create checkout item
    // 2) navigate sang checkout
  };

  if (!id || Number.isNaN(productId)) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-10 lg:px-6">
        <div className="rounded-2xl border border-dashed border-stone-300 px-6 py-10 text-center text-stone-500">
          Sản phẩm không hợp lệ.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-10 lg:px-6">
        <div className="text-stone-500">Đang tải chi tiết sản phẩm...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-10 lg:px-6">
        <div className="rounded-2xl border border-dashed border-stone-300 px-6 py-10 text-center text-stone-500">
          Không tìm thấy sản phẩm.
        </div>
      </div>
    );
  }

  const displayImageUrl = selectedImage?.imageUrl
    ? getProductImageUrl(selectedImage.imageUrl)
    : product.thumbnail
    ? getProductImageUrl(product.thumbnail)
    : FALLBACK_IMAGE;

  const price = product.salePrice ?? product.price;
  const originalPrice = product.discountPercent > 0 ? product.price : null;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 lg:px-6">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[90px_minmax(0,520px)_1fr]">
        <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col">
          {loadingImages ? (
            <div className="text-sm text-stone-400">Đang tải ảnh...</div>
          ) : images.length > 0 ? (
            images.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setSelectedImage(img)}
                className={`overflow-hidden rounded-xl border-2 ${
                  selectedImage?.id === img.id
                    ? "border-stone-900"
                    : "border-stone-200"
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
            <div className="text-sm text-stone-400">Không có ảnh.</div>
          )}
        </div>

        <div className="order-1 overflow-hidden rounded-2xl bg-stone-100 lg:order-2">
          <img
            src={displayImageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

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

          <div className="mt-6">
            <h3 className="mb-3 text-sm font-bold uppercase text-stone-700">
              Màu sắc
            </h3>

            <div className="flex flex-wrap gap-3">
              {colors.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setSelectedColorId(color.id)}
                  className={`h-10 w-10 rounded-full border-2 ${
                    selectedColorId === color.id
                      ? "border-blue-600"
                      : "border-stone-300"
                  }`}
                  style={{ backgroundColor: color.code || "#ddd" }}
                  title={color.name}
                />
              ))}
            </div>

            {selectedVariant?.color && (
              <p className="mt-2 text-sm text-stone-600">
                Màu đã chọn: {selectedVariant.color.name}
              </p>
            )}
          </div>

          <div className="mt-6">
            <h3 className="mb-3 text-sm font-bold uppercase text-stone-700">
              Kích thước
            </h3>

            <div className="flex flex-wrap gap-3">
              {sizes.map((size) => {
                const isSelected = selectedSizeId === size.id;
                return (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => setSelectedSizeId(size.id)}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium ${
                      isSelected
                        ? "border-blue-600 text-blue-600"
                        : "border-stone-300 text-stone-700"
                    }`}
                  >
                    {size.name}
                  </button>
                );
              })}
            </div>

            {selectedVariant?.size && (
              <p className="mt-2 text-sm text-stone-600">
                Size đã chọn: {selectedVariant.size.name}
              </p>
            )}
          </div>

        

          <div className="mt-6 rounded-xl bg-stone-50 p-4 text-sm text-stone-700">

            <p className="mt-2">
              <strong>Tồn kho:</strong>{" "}
              {selectedVariant?.stockQuantity ?? "Chưa xác định"}
            </p>
            <p className="mt-2">
              <strong>Chất liệu:</strong> {product.material || "Đang cập nhật"}
            </p>
          </div>


            <div className="mt-6">
            <h3 className="mb-3 text-sm font-bold uppercase text-stone-700">
              Số lượng
            </h3>

            <div className="flex items-center gap-3">
              <div className="flex items-center overflow-hidden rounded-xl border border-stone-300">
                <button
                  type="button"
                  onClick={handleDecreaseQuantity}
                  className="flex h-10 w-10 items-center justify-center hover:bg-stone-100"
                >
                  -
                </button>

                <input
                  type="number"
                  value={quantity}
                  min="1"
                  max={selectedVariant?.stockQuantity || 1}
                  onChange={handleQuantityChange}
                  className="w-14 text-center outline-none"
                />

                <button
                  type="button"
                  onClick={handleIncreaseQuantity}
                  className="flex h-10 w-10 items-center justify-center hover:bg-stone-100"
                >
                  +
                </button>
              </div>

              <span className="text-sm text-stone-500">
                Còn {selectedVariant?.stockQuantity ?? 0} sản phẩm
              </span>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!selectedVariant || selectedVariant.stockQuantity <= 0}
              className={`rounded-xl px-6 py-3 text-white ${
                !selectedVariant || selectedVariant.stockQuantity <= 0
                  ? "cursor-not-allowed bg-stone-400"
                  : "bg-stone-900 hover:bg-stone-800"
              }`}
            >
              Thêm vào giỏ hàng
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!selectedVariant || selectedVariant.stockQuantity <= 0}
              className={`rounded-xl border px-6 py-3 ${
                !selectedVariant || selectedVariant.stockQuantity <= 0
                  ? "cursor-not-allowed border-stone-200 text-stone-400"
                  : "border-stone-300 text-stone-900 hover:bg-stone-50"
              }`}
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="mb-4 text-xl font-bold text-stone-900">Mô tả sản phẩm</h2>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="whitespace-pre-line leading-7 text-stone-700">
            {product.description || "Đang cập nhật mô tả sản phẩm."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;