import { getProductImageUrl } from '../services/productService';

export function adaptBackendProduct(backendProduct) {
  if (!backendProduct) return null;

  const imageUrl = getProductImageUrl(backendProduct.thumbnail) || '/placeholder.jpg';

  return {
    id: backendProduct.id,
    name: backendProduct.name,
    slug: backendProduct.slug,
    price: backendProduct.salePrice || backendProduct.price,
    originalPrice: backendProduct.price,
    description: backendProduct.description,
    shortDescription: backendProduct.shortDescription,
    images: [imageUrl],

    // Colors
    // - UI yêu cầu color code/id để render "màu" dạng dots/hoặc hiển thị màu.
    // - Nếu backend trả về color như một string/name thì vẫn fallback an toàn.
    colors:
      backendProduct?.color?.code || backendProduct?.color?.id
        ? [backendProduct.color]
        : backendProduct.color?.name
          ? [backendProduct.color.name]
          : backendProduct?.colors
            ? backendProduct.colors
            : [],

    sizes:
      backendProduct?.size?.name
        ? [backendProduct.size.name]
        : backendProduct?.sizes
          ? backendProduct.sizes
          : ['M', 'L', 'XL'],

    badge: backendProduct.subCategory?.name || '',
    discount: backendProduct.discountPercent || 0,
  };
}

