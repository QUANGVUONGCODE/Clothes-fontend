import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import {
  getProductImageUrl,
  getProductsByDepartmentId,
  getProductVariantsByProductId,
} from "../services/productService";
import { getCategoriesByDepartmentId } from "../services/categoryService";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80";

function DepartmentProductPage() {
  const { id } = useParams();
  const location = useLocation();

  const departmentName =
    location.state?.departmentName || "Danh mục sản phẩm";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [productColorsMap, setProductColorsMap] = useState({});

  useEffect(() => {
    const departmentId = Number(id);
    if (!departmentId) return;

    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);

        const result = await getProductsByDepartmentId(departmentId);
        setProducts(result);

        const colorsMap = {};

        await Promise.all(
          result.map(async (product) => {
            try {
              const variants = await getProductVariantsByProductId(product.id);

              const uniqueColors = [];
              const seen = new Set();

              variants.forEach((variant) => {
                const color = variant.color;
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
        console.error("Lỗi lấy sản phẩm theo department:", error);
        setProducts([]);
        setProductColorsMap({});
      } finally {
        setLoadingProducts(false);
      }
    };

    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const result = await getCategoriesByDepartmentId(departmentId);
        setCategories(result);
      } catch (error) {
        console.error("Lỗi lấy category:", error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    setSelectedCategoryId(null);
    fetchProducts();
    fetchCategories();
  }, [id]);

  const filteredProducts = useMemo(() => {
    if (!selectedCategoryId) return products;

    return products.filter(
      (product) => product.subCategory?.category?.id === selectedCategoryId
    );
  }, [products, selectedCategoryId]);

  return (
    <MainLayout>
      <div className="mx-auto max-w-[1440px] px-4 py-10 lg:px-6">
        <div className="mb-8">
          <p className="text-sm text-stone-500">Trang chủ / {departmentName}</p>
          <h1 className="mt-2 text-3xl font-extrabold uppercase text-stone-900">
            {departmentName}
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-3">
              <h2 className="text-xl font-bold text-stone-900">Bộ lọc</h2>
              <span className="text-sm text-stone-500">
                {filteredProducts.length} kết quả
              </span>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase text-stone-700">Danh mục</h3>
              </div>

              {loadingCategories ? (
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-5 w-full animate-pulse rounded bg-stone-200"
                    />
                  ))}
                </div>
              ) : categories.length > 0 ? (
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategoryId === null}
                      onChange={() => setSelectedCategoryId(null)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-stone-700">Tất cả sản phẩm</span>
                  </label>

                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex cursor-pointer items-center gap-3"
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategoryId === category.id}
                        onChange={() => setSelectedCategoryId(category.id)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm text-stone-700">{category.name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-stone-500">Không có danh mục.</p>
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
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => {
                  const imageUrl = getProductImageUrl(product.thumbnail);
                  const price = product.salePrice ?? product.price;
                  const originalPrice =
                    product.discountPercent > 0 ? product.price : null;
                  const colors = productColorsMap[product.id] || [];

                  return (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="aspect-[4/5] overflow-hidden bg-stone-100">
                        <img
                          src={imageUrl || FALLBACK_IMAGE}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      </div>

                      <div className="p-3">
                        {colors.length > 0 && (
                          <div className="mb-2 flex items-center gap-2">
                            {colors.map((color, index) => (
                              <span
                                key={color.id}
                                className={`h-6 w-6 rounded-full border-2 shadow-sm ${
                                  index === 0
                                    ? "border-blue-500"
                                    : "border-stone-300"
                                }`}
                                style={{
                                  backgroundColor: color.code || "#dddddd",
                                }}
                                title={color.name}
                              />
                            ))}
                          </div>
                        )}

                        <h3 className="line-clamp-2 min-h-[48px] text-sm font-medium text-stone-900">
                          {product.name}
                        </h3>

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
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-stone-300 px-6 py-10 text-center text-stone-500">
                Không có sản phẩm nào phù hợp.
              </div>
            )}
          </section>
        </div>
      </div>
    </MainLayout>
  );
}

export default DepartmentProductPage;

