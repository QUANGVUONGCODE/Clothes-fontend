import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import {
  getProductImageUrl,
  getProductsBySubCategoryId,
  getProductVariantsByProductId,
} from "../services/productService";
import { getSubCategoriesByCategoryId } from "../services/subCategoryService";


const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80";

function SubCategoryProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const subCategoryId = Number(id);
  const subCategoryNameFromState = location.state?.subCategoryName;
  const categoryId = location.state?.categoryId;
  const categoryNameFromState = location.state?.categoryName;

  const [products, setProducts] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [productColorsMap, setProductColorsMap] = useState({});

  const subCategoryName = useMemo(() => {
    if (subCategoryNameFromState) return subCategoryNameFromState;
    return (
      subCategories.find((s) => Number(s.id) === Number(subCategoryId))?.name ||
      "Danh mục nhỏ"
    );
  }, [subCategoryId, subCategoryNameFromState, subCategories]);

  const categoryName = useMemo(() => {
    return categoryNameFromState || "Danh mục";
  }, [categoryNameFromState]);

  useEffect(() => {
    if (!subCategoryId) return;

    const fetchProducts = async () => {
      try {
        const result = await getProductsBySubCategoryId(subCategoryId);
        setProducts(result);

        const colorsMap = {};

        await Promise.all(
          result.map(async (product) => {
            try {
              const variants = await getProductVariantsByProductId(product.id);

              const uniqueColors = [];
              const seen = new Set();

              (variants || []).forEach((variant) => {
                const color = variant.color;
                if (color && !seen.has(color.id)) {
                  seen.add(color.id);
                  uniqueColors.push(color);
                }
              });

              colorsMap[product.id] = uniqueColors;
            } catch {
              colorsMap[product.id] = [];
            }
          })
        );

        setProductColorsMap(colorsMap);
      } catch (error) {
        console.error(error);
        setProducts([]);
        setProductColorsMap({});
      }
    };

    fetchProducts();
  }, [subCategoryId]);

  useEffect(() => {
    if (!categoryId) return;

    const fetchSubCategories = async () => {
      try {
        const result = await getSubCategoriesByCategoryId(categoryId);
        setSubCategories(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error(error);
        setSubCategories([]);
      }
    };

    fetchSubCategories();
  }, [categoryId]);

  return (
    <MainLayout>
      <div className="mx-auto max-w-[1440px] px-4 py-10 lg:px-6">
        <div className="mb-8">
          <p className="text-sm text-stone-500">
            Trang chủ / {categoryName} / {subCategoryName}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold uppercase text-stone-900">
            {subCategoryName}
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-3">
              <h2 className="text-xl font-bold text-stone-900">Bộ lọc</h2>
              <span className="text-sm text-stone-500">{products.length} kết quả</span>
            </div>

            <div className="space-y-3">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="radio"
                  name="subCategory"
                  disabled={!categoryId}
                  checked={subCategoryId && subCategoryId === null}
                  onChange={() => {
                    if (!categoryId) return;
                    navigate(`/category/${categoryId}`, { state: { categoryName } });
                  }}
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
                    checked={Number(sub.id) === Number(subCategoryId)}
                    onChange={() =>
                      navigate(`/sub-category/${sub.id}`, {
                        state: {
                          subCategoryName: sub.name,
                          categoryId,
                          categoryName,
                        },
                      })
                    }
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-stone-700">{sub.name}</span>
                </label>
              ))}
            </div>
          </aside>

          <section>
            {products.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => {
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
                Không có sản phẩm nào trong danh mục này.
              </div>
            )}
          </section>
        </div>
      </div>
    </MainLayout>
  );
}

export default SubCategoryProductPage;

