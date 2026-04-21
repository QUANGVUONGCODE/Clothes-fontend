import { useMemo } from 'react';
import { products } from '../data/products';

export function useProducts(filters = {}) {
  return useMemo(() => {
    let result = [...products];

    if (filters.gender) {
      result = result.filter((item) => item.gender === filters.gender || item.gender === 'Unisex');
    }

    if (filters.collection) {
      result = result.filter((item) => item.collection === filters.collection);
    }

    if (filters.category) {
      result = result.filter((item) => item.category === filters.category);
    }

    if (filters.search) {
      const keyword = filters.search.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(keyword) ||
          item.category.toLowerCase().includes(keyword) ||
          item.material.toLowerCase().includes(keyword),
      );
    }

    if (filters.sort === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (filters.sort === 'price-desc') result.sort((a, b) => b.price - a.price);
    if (filters.sort === 'best-selling') result.sort((a, b) => b.reviews - a.reviews);
    if (filters.sort === 'newest') result.sort((a, b) => Number(b.isNew) - Number(a.isNew));

    return result;
  }, [filters]);
}
