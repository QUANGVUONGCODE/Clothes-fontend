import { useEffect, useState } from "react";

function HeroBanner({ banners = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!banners.length) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [banners]);

  if (!banners.length) return null;

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[260px] w-full sm:h-[360px] lg:h-[520px] xl:h-[620px]">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={banner.image}
              alt={`Banner ${banner.id}`}
              className="h-full w-full object-cover"
            />
          </div>
        ))}

        <button
          onClick={goToPrev}
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 px-3 py-2 text-sm font-bold text-stone-900 transition hover:bg-white"
          aria-label="Banner trước"
        >
          ‹
        </button>

        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 px-3 py-2 text-sm font-bold text-stone-900 transition hover:bg-white"
          aria-label="Banner sau"
        >
          ›
        </button>

        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              onClick={() => setCurrentIndex(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === currentIndex ? "w-8 bg-white" : "w-2.5 bg-white/60"
              }`}
              aria-label={`Chuyển đến banner ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;