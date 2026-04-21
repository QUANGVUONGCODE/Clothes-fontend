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
    colors: backendProduct.color ? [backendProduct.color.name] : [],
    sizes: backendProduct.size ? [backendProduct.size.name] : ['M', 'L', 'XL'],
    badge: backendProduct.subCategory?.name || '',
    discount: backendProduct.discountPercent || 0,
  };
}

