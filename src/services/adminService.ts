import { apiClient } from '../utils/apiClient';

const DASHBOARD = '/shopclothes/api/v1/dashboard';
const PRODUCTS  = '/shopclothes/api/v1/products';
const ORDERS    = '/shopclothes/api/v1/orders';
const USERS     = '/shopclothes/api/v1/users';
const VARIANTS  = '/shopclothes/api/v1/product-variants';
const COLORS    = '/shopclothes/api/v1/colors';
const SIZES     = '/shopclothes/api/v1/sizes';

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
export const getAllOrders = (page = 0, limit = 10, status = '') => {
  const statusParam = status ? `&status=${status}` : '';
  return apiClient(`${ORDERS}?page=${page}&limit=${limit}${statusParam}`);
};

export const getOrderDetail = (id: number) =>
  apiClient(`${ORDERS}/${id}`);

export const updateOrderStatus = (id: number, status: string) =>
  apiClient(`${ORDERS}/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });

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
export const getColors   = ()                         => apiClient(COLORS);
export const createColor = (body: object)             => apiClient(COLORS,          { method: 'POST',   body: JSON.stringify(body) });
export const updateColor = (id: number, body: object) => apiClient(`${COLORS}/${id}`, { method: 'PUT',    body: JSON.stringify(body) });
export const deleteColor = (id: number)               => apiClient(`${COLORS}/${id}`, { method: 'DELETE' });

export const getSizes    = ()                         => apiClient(SIZES);
export const createSize  = (body: object)             => apiClient(SIZES,           { method: 'POST',   body: JSON.stringify(body) });
export const updateSize  = (id: number, body: object) => apiClient(`${SIZES}/${id}`,  { method: 'PUT',    body: JSON.stringify(body) });
export const deleteSize  = (id: number)               => apiClient(`${SIZES}/${id}`,  { method: 'DELETE' });

const DEPTS_API = '/shopclothes/api/v1/departments';
const CATS_API  = '/shopclothes/api/v1/categories';
const SUBS_API  = '/shopclothes/api/v1/sub-categories';

/* ── Departments CRUD ── */
export const getAllDepartments  = ()                         => apiClient(DEPTS_API);
export const createDepartment  = (body: object)             => apiClient(DEPTS_API,           { method: 'POST',   body: JSON.stringify(body) });
export const updateDepartment  = (id: number, body: object) => apiClient(`${DEPTS_API}/${id}`, { method: 'PUT',    body: JSON.stringify(body) });
export const deleteDepartment  = (id: number)               => apiClient(`${DEPTS_API}/${id}`, { method: 'DELETE' });

/* ── Categories CRUD ── */
export const getCatsByDept     = (deptId: number)           => apiClient(`${CATS_API}/${deptId}`);
export const createCategory    = (body: object)             => apiClient(CATS_API,            { method: 'POST',   body: JSON.stringify(body) });
export const updateCategory    = (id: number, body: object) => apiClient(`${CATS_API}/${id}`,  { method: 'PUT',    body: JSON.stringify(body) });
export const deleteCategory    = (id: number)               => apiClient(`${CATS_API}/${id}`,  { method: 'DELETE' });

/* ── SubCategories CRUD ── */
export const getSubCatsByCat   = (catId: number)            => apiClient(`${SUBS_API}/${catId}`);
export const createSubCategory = (body: object)             => apiClient(SUBS_API,            { method: 'POST',   body: JSON.stringify(body) });
export const updateSubCategory = (id: number, body: object) => apiClient(`${SUBS_API}/${id}`,  { method: 'PUT',    body: JSON.stringify(body) });
export const deleteSubCategory = (id: number)               => apiClient(`${SUBS_API}/${id}`,  { method: 'DELETE' });
