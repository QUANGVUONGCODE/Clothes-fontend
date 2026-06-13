import { apiClient } from '../utils/apiClient';
import type { URLSearchParamsInit } from 'react-router-dom';

const DASHBOARD = '/shopclothes/api/v1/dashboard';
const PRODUCTS  = '/shopclothes/api/v1/products';
const ORDERS    = '/shopclothes/api/v1/orders';
const USERS     = '/shopclothes/api/v1/users';
const VARIANTS  = '/shopclothes/api/v1/product-variants';
const COLORS    = '/shopclothes/api/v1/colors';
const SIZES     = '/shopclothes/api/v1/sizes';
const INVOICES  = '/shopclothes/api/v1/invoices';

/* ── Dashboard ── */
export const getDashboardOverview = () => apiClient(`${DASHBOARD}/overview`);
export const getOrderStatus       = () => apiClient(`${DASHBOARD}/order-status`);
export const getRecentOrders      = (limit = 5) =>
  apiClient(`${DASHBOARD}/recent-orders?limit=${limit}`);

/* ── Products ── */
export const getProducts = (keyword = '', page = 0, limit = 10) =>
  apiClient(`${PRODUCTS}/search?keyword=${encodeURIComponent(keyword)}&page=${page}&limit=${limit}`);

export const createProduct = (body: object) =>
  apiClient(PRODUCTS, { method: 'POST', body: JSON.stringify(body) });

export const updateProduct = (id: number, body: object) =>
  apiClient(`${PRODUCTS}/${id}`, { method: 'PUT', body: JSON.stringify(body) });

export const deleteProduct = (id: number) =>
  apiClient(`${PRODUCTS}/${id}`, { method: 'DELETE' });

/* ── Orders (admin) ── */
export const getAllOrders = (page = 0, limit = 10, status = '', keyword = '') => {
  // Backend requirement: chỉ cần keyword để search.
  // Tránh truyền status vì backend có thể không áp dụng theo status khi search.
  const keywordParam = keyword ? `&keyword=${encodeURIComponent(keyword)}` : '';
  return apiClient(`${ORDERS}?page=${page}&limit=${limit}${keywordParam}`);
};

export const getOrderDetail = (id: number) =>
  apiClient(`${ORDERS}/${id}`);

export const updateOrderStatus = (id: number, status: string) =>
  apiClient(`${ORDERS}/status/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });

export const getInvoiceByOrderCode = (orderCode: string) =>
  apiClient(`${INVOICES}/order-code/${encodeURIComponent(orderCode)}`);

/* ── Users (admin) ── */
export const getAllUsers = (page = 0, limit = 10, keyword = '') => {
  const keywordParam = keyword ? `&keyword=${encodeURIComponent(keyword)}` : '';
  return apiClient(`${USERS}?page=${page}&limit=${limit}${keywordParam}`);
};

export const toggleUserActive = (id: number, isActive: boolean) =>
  apiClient(`${USERS}/${id}/active`, {
    method: 'PUT',
    body: JSON.stringify({ is_active: isActive }),
  });

/* ── Product Variants ── */
export const getVariantsSearch = (params: { productId?: number; colorId?: number; sizeId?: number } = {}) => {
  const { productId, colorId, sizeId } = params;
  const query = new URLSearchParams();
  if (productId) query.append('product_id', productId.toString());
  if (colorId) query.append('color_id', colorId.toString());
  if (sizeId) query.append('size_id', sizeId.toString());
  return apiClient(`${VARIANTS}/search?${query.toString()}`);
};

export const getVariantsByProduct = (productId: number) =>
  apiClient(`${VARIANTS}/search?product_id=${productId}`);

export const getAllVariants = () =>
  apiClient(`${VARIANTS}/search?page=0&limit=1000`);

export const createVariant = (body: object) =>
  apiClient(VARIANTS, { method: 'POST', body: JSON.stringify(body) });

export const updateVariant = (id: number, body: object) =>
  apiClient(`${VARIANTS}/${id}`, { method: 'PUT', body: JSON.stringify(body) });

export const deleteVariant = (id: number) =>
  apiClient(`${VARIANTS}/${id}`, { method: 'DELETE' });

/* ── Colors & Sizes ── */
export const getColors   = ()                         => apiClient(`${COLORS}?page=0&limit=100`);
export const createColor = (body: object)             => apiClient(COLORS,          { method: 'POST',   body: JSON.stringify(body) });
export const updateColor = (id: number, body: object) => apiClient(`${COLORS}/${id}`, { method: 'PUT',    body: JSON.stringify(body) });
export const deleteColor = (id: number)               => apiClient(`${COLORS}/${id}`, { method: 'DELETE' });

export const getSizes    = ()                         => apiClient(`${SIZES}?page=0&limit=100`);
export const createSize  = (body: object)             => apiClient(SIZES,           { method: 'POST',   body: JSON.stringify(body) });
export const updateSize  = (id: number, body: object) => apiClient(`${SIZES}/${id}`,  { method: 'PUT',    body: JSON.stringify(body) });
export const deleteSize  = (id: number)               => apiClient(`${SIZES}/${id}`,  { method: 'DELETE' });

/* ── Product Images ── */
const IMAGES_API = '/shopclothes/api/v1/product-images/upload';

export const uploadProductImages = async (productId: number, colorId: number, files: File[]) => {
  const formData = new FormData();
  formData.append('productId', productId.toString());
  formData.append('colorId', colorId.toString());
  
  for (const file of files) {
    formData.append('files', file);
  }
  
  return apiClient(IMAGES_API, {
    method: 'POST',
    body: formData
  });
};

/* ── Categories CRUD ── */
const DEPTS_API = '/shopclothes/api/v1/departments';
const CATS_API  = '/shopclothes/api/v1/categories';
const SUBS_API  = '/shopclothes/api/v1/sub-categories';

export const getAllDepartments  = ()                         => apiClient(DEPTS_API);
export const createDepartment  = (body: object)             => apiClient(DEPTS_API,           { method: 'POST',   body: JSON.stringify(body) });
export const updateDepartment  = (id: number, body: object) => apiClient(`${DEPTS_API}/${id}`, { method: 'PUT',    body: JSON.stringify(body) });
export const deleteDepartment  = (id: number)               => apiClient(`${DEPTS_API}/${id}`, { method: 'DELETE' });

export const getCatsByDept     = (deptId: number)           => apiClient(`${CATS_API}/${deptId}`);
export const createCategory    = (body: object)             => apiClient(CATS_API,            { method: 'POST',   body: JSON.stringify(body) });
export const updateCategory    = (id: number, body: object) => apiClient(`${CATS_API}/${id}`,  { method: 'PUT',    body: JSON.stringify(body) });
export const deleteCategory    = (id: number)               => apiClient(`${CATS_API}/${id}`,  { method: 'DELETE' });

export const getSubCatsByCat   = (catId: number)            => apiClient(`${SUBS_API}/${catId}`);
export const createSubCategory = (body: object)             => apiClient(SUBS_API,            { method: 'POST',   body: JSON.stringify(body) });
export const updateSubCategory = (id: number, body: object) => apiClient(`${SUBS_API}/${id}`,  { method: 'PUT',    body: JSON.stringify(body) });
export const deleteSubCategory = (id: number)               => apiClient(`${SUBS_API}/${id}`,  { method: 'DELETE' });

/* 
5 Sub-category images (thumbnails) */
// Upload ảnh cho sub-category thumbnail (API riêng)
const SUB_CATEGORY_IMAGES_API = '/shopclothes/api/v1/sub-category-images/upload';

export const uploadSubCategoryImages = async (
  subCategoryId: number,
  files: File[]
) => {
  const formData = new FormData();

  // Backend yêu cầu query param: ...?subCategoryId=<id>
  // FormData chỉ mang file ảnh
  for (const file of files) {
    formData.append('files', file);
  }

  return apiClient(
    `${SUB_CATEGORY_IMAGES_API}?subCategoryId=${subCategoryId}`,
    {
      method: 'POST',
      body: formData,
    }
  );
};


