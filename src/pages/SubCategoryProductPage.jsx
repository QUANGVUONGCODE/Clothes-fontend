import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
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
  const subCategoryName = location.state?.subCategoryName || "Danh mục nhỏ";
  const categoryId = location.state?.categoryId;
  const categoryName = location.state?.categoryName || "Danh mục";

  const [products, setProducts] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [productColorsMap, setProductColorsMap] = useState({});

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

              variants.forEach((variant) => {
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
      }
    };

    fetchProducts();
  }, [subCategoryId]);

  useEffect(() => {
    if (!categoryId) return;

    const fetchSubCategories = async () => {
      try {
        const result = await getSubCategoriesByCategoryId(categoryId);
        setSubCategories(result);
      } catch (error) {
        console.error(error);
        setSubCategories([]);
      }
    };

    fetchSubCategories();
  }, [categoryId]);

  return (
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
                onChange={() =>
                  navigate(`/category/${categoryId}`, {
                    state: { categoryName },
                  })
                }
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
                  checked={sub.id === subCategoryId}
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
                const colors = productColorsMap[product.id] || [];

                return (
                  <Link key={product.id} to={`/products/${product.id}`}>
                    <img src={imageUrl || FALLBACK_IMAGE} alt={product.name} />
                    <div>{product.name}</div>
                    <div>{colors.length} màu</div>
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
  );
}

export default SubCategoryProductPage;