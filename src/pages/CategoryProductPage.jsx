import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  getProductImageUrl,
  getProductsByCategoryId,
  getProductsBySubCategoryId,
  getProductVariantsByProductId,
} from "../services/productService";
import { getSubCategoriesByCategoryId } from "../services/subCategoryService";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80";

function CategoryProductPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryId = Number(id);
  const categoryName = location.state?.categoryName || "Danh mục sản phẩm";

  const subFromUrl = searchParams.get("sub");
  const initialSubId =
    subFromUrl && !Number.isNaN(Number(subFromUrl)) ? Number(subFromUrl) : null;

  const [products, setProducts] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCategoryId, setSelectedSubCategoryId] =
    useState(initialSubId);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);
  const [productColorsMap, setProductColorsMap] = useState({});

  useEffect(() => {
    const sub = searchParams.get("sub");
    const nextSubId =
      sub && !Number.isNaN(Number(sub)) ? Number(sub) : null;
    setSelectedSubCategoryId(nextSubId);
  }, [searchParams]);

  useEffect(() => {
    if (!categoryId || Number.isNaN(categoryId)) return;

    const fetchSubCategories = async () => {
      try {
        setLoadingSubCategories(true);
        const result = await getSubCategoriesByCategoryId(categoryId);
        setSubCategories(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Lỗi lấy sub-category:", error);
        setSubCategories([]);
      } finally {
        setLoadingSubCategories(false);
      }
    };

    fetchSubCategories();
  }, [categoryId]);

  useEffect(() => {
    if (!categoryId || Number.isNaN(categoryId)) return;

    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);

        let result = [];
        if (selectedSubCategoryId !== null) {
          result = await getProductsBySubCategoryId(Number(selectedSubCategoryId));
        } else {
          result = await getProductsByCategoryId(Number(categoryId));
        }

        const safeProducts = Array.isArray(result) ? result : [];
        setProducts(safeProducts);

        const colorsMap = {};

        await Promise.all(
          safeProducts.map(async (product) => {
            try {
              const variants = await getProductVariantsByProductId(product.id);

              const uniqueColors = [];
              const seen = new Set();

              (variants || []).forEach((variant) => {
                const color = variant?.color;
                if (color && !seen.has(color.id)) {
                  seen.add(color.id);
                  uniqueColors.push(color);
                }
              });

              colorsMap[product.id] = uniqueColors;
            } catch (error) {
              console.error(`Lỗi lấy màu cho product ${product.id}:`, error);
              colorsMap[product.id] = [];
            }
          })
        );

        setProductColorsMap(colorsMap);
      } catch (error) {
        console.error("Lỗi lấy sản phẩm:", error);
        setProducts([]);
        setProductColorsMap({});
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [categoryId, selectedSubCategoryId]);

  const selectedSubCategoryName = useMemo(() => {
    return (
      subCategories.find(
        (sub) => Number(sub.id) === Number(selectedSubCategoryId)
      )?.name || null
    );
  }, [subCategories, selectedSubCategoryId]);

  const handleSelectAll = () => {
    setSelectedSubCategoryId(null);
    setSearchParams({});
  };

  const handleSelectSubCategory = (subId) => {
    const numericId = Number(subId);
    setSelectedSubCategoryId(numericId);
    setSearchParams({ sub: String(numericId) });
  };

  const handleQuickAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const variants = await getProductVariantsByProductId(product.id);

      const activeVariants = (variants || []).filter(
        (variant) =>
          variant?.status === "ACTIVE" && (variant?.stockQuantity || 0) > 0
      );

      if (activeVariants.length === 1) {
        const payload = {
          productId: product.id,
          productVariantId: activeVariants[0].id,
          quantity: 1,
        };

        console.log("QUICK ADD TO CART =", payload);

        // TODO: gọi API thêm giỏ hàng ở đây
        // await addToCart(payload);

        alert("Đã thêm vào giỏ hàng");
        return;
      }

      navigate(`/products/${product.id}`);
    } catch (error) {
      console.error("Lỗi thêm vào giỏ hàng nhanh:", error);
    }
  };

  if (!id || Number.isNaN(categoryId)) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-10 lg:px-6">
        <div className="rounded-2xl border border-dashed border-stone-300 px-6 py-10 text-center text-stone-500">
          Category không hợp lệ.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 lg:px-6">
      <div className="mb-8">
        <p className="text-sm text-stone-500">
          Trang chủ / Danh mục / {selectedSubCategoryName || categoryName}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold uppercase text-stone-900">
          {selectedSubCategoryName || categoryName}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-3">
            <h2 className="text-xl font-bold text-stone-900">Bộ lọc</h2>
            <span className="text-sm text-stone-500">{products.length} kết quả</span>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase text-stone-700">
                Danh mục nhỏ
              </h3>
            </div>

            {loadingSubCategories ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-5 w-full animate-pulse rounded bg-stone-200"
                  />
                ))}
              </div>
            ) : subCategories.length > 0 ? (
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    name="subCategory"
                    checked={selectedSubCategoryId === null}
                    onChange={handleSelectAll}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-stone-700">Tất cả</span>
                </label>

                {subCategories.map((sub) => (
                  <label
                    key={sub.id}
                    className="flex cursor-pointer items-center gap-3"
                  >
                    <input
                      type="radio"
                      name="subCategory"
                      checked={Number(selectedSubCategoryId) === Number(sub.id)}
                      onChange={() => handleSelectSubCategory(sub.id)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-stone-700">{sub.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone-500">Không có danh mục nhỏ.</p>
            )}
          </div>
        </aside>

        <section>
          {loadingProducts ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm"
                >
                  <div className="aspect-[4/5] animate-pulse bg-stone-200" />
                  <div className="p-3">
                    <div className="mb-3 flex gap-2">
                      {Array.from({ length: 3 }).map((_, colorIndex) => (
                        <div
                          key={colorIndex}
                          className="h-6 w-6 animate-pulse rounded-full bg-stone-200"
                        />
                      ))}
                    </div>
                    <div className="mb-2 h-4 w-24 animate-pulse rounded bg-stone-200" />
                    <div className="mb-2 h-4 w-40 animate-pulse rounded bg-stone-200" />
                    <div className="h-4 w-16 animate-pulse rounded bg-stone-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => {
                const imageUrl = getProductImageUrl(product.thumbnail);
                const price = product.salePrice ?? product.price;
                const originalPrice =
                  product.discountPercent > 0 ? product.price : null;
                const colors = productColorsMap[product.id] || [];

                return (
                  <div
                    key={product.id}
                    className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <Link to={`/products/${product.id}`}>
                      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
                        <img
                          src={imageUrl || FALLBACK_IMAGE}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />

                        <div className="absolute inset-x-3 bottom-3 translate-y-4 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={(e) => handleQuickAddToCart(e, product)}
                            className="w-full rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-stone-800"
                          >
                            Thêm vào giỏ hàng
                          </button>
                        </div>
                      </div>
                    </Link>

                    <div className="p-3">
                      {colors.length > 0 && (
                        <>
                          <div className="mb-2 flex items-center gap-2">
                            {colors.map((color, index) => (
                              <span
                                key={color.id}
                                className={`h-6 w-6 rounded-full border-2 shadow-sm ${
                                  index === 0 ? "border-blue-500" : "border-stone-300"
                                }`}
                                style={{ backgroundColor: color.code || "#dddddd" }}
                                title={color.name}
                              />
                            ))}
                          </div>

                          <p className="mb-2 text-xs text-stone-500">
                            {colors.length} màu
                          </p>
                        </>
                      )}

                      <Link to={`/products/${product.id}`}>
                        <h3 className="line-clamp-2 min-h-[48px] text-sm font-medium text-stone-900">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="mt-3 flex items-center gap-2">
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
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-300 px-6 py-10 text-center text-stone-500">
              Không có sản phẩm nào trong danh mục này.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default CategoryProductPage;