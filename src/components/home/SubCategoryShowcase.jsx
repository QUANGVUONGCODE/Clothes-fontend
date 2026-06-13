import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  searchSubCategoriesByDepartmentId,
  getProductImageUrl,
} from "../../services/subCategoryService";

const TAB_CONFIG = [
  { key: "men", label: "NAM", departmentId: 2 },
  { key: "women", label: "NỮ", departmentId: 3 },
];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80";

function SubCategoryShowcase() {
  const [activeTab, setActiveTab] = useState("men");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentTab = TAB_CONFIG.find((tab) => tab.key === activeTab);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await searchSubCategoriesByDepartmentId(
          currentTab.departmentId,
          0,
          10
        );
        setItems(result);
        setCurrentIndex(0);
      } catch (error) {
        console.error("Lỗi lấy sub-category:", error);
        setItems([]);
        setCurrentIndex(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentTab.departmentId]);

  const maxIndex = useMemo(() => {
    if (items.length <= 5) return 0;
    return items.length - 5;
  }, [items]);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-10 lg:px-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {TAB_CONFIG.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-full px-6 py-3 text-sm font-bold uppercase transition ${
                  isActive
                    ? "bg-black text-white"
                    : "bg-stone-200 text-stone-900 hover:bg-stone-300"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {!loading && items.length > 5 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-white transition hover:opacity-85 disabled:cursor-not-allowed disabled:bg-stone-300"
              aria-label="Sang trái"
            >
              ←
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex === maxIndex}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-white transition hover:opacity-85 disabled:cursor-not-allowed disabled:bg-stone-300"
              aria-label="Sang phải"
            >
              →
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl bg-white shadow-sm"
            >
              <div className="aspect-[4/5] animate-pulse bg-stone-200" />
              <div className="p-3">
                <div className="mx-auto h-5 w-24 animate-pulse rounded bg-stone-200" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="overflow-hidden">
          <div
            className="flex gap-4 transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(calc(-${currentIndex} * ((100% - 64px) / 5 + 16px)))`,
            }}
          >
            {items.map((item) => {
              const imageUrl = getProductImageUrl(item.thumbnail);

              return (
                <Link
                  key={item.id}
                  to={`/sub-category/${item.id}`}
                  state={{ subCategoryName: item.name, categoryId: item.category?.id ?? null, categoryName: item.category?.name ?? "Danh mục" }}
                  className="group w-[calc((100%-64px)/5)] min-w-[calc((100%-64px)/5)] flex-shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="aspect-[4/5] overflow-hidden bg-stone-100">
                    <img
                      src={imageUrl || FALLBACK_IMAGE}
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div className="p-3 text-center">
                    <h3 className="line-clamp-1 text-lg font-bold uppercase text-stone-900">
                      {item.name}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-stone-300 px-6 py-10 text-center text-stone-500">
          Chưa có dữ liệu danh mục hiển thị.
        </div>
      )}

      {!loading && items.length > 5 && (
        <div className="mt-5 flex items-center justify-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={`h-2.5 rounded-full transition-all ${
                currentIndex === index ? "w-8 bg-black" : "w-2.5 bg-stone-300"
              }`}
              aria-label={`Chuyển đến vị trí ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default SubCategoryShowcase;