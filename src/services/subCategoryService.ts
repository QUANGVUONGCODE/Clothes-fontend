import type { SubCategory } from "../types/menu";

const API_BASE = "/shopclothes/api/v1";
const IMAGE_BASE = `${API_BASE}/product-images/images`;

export async function getSubCategoriesByCategoryId(
  categoryId: number
): Promise<SubCategory[]> {
  const response = await fetch(`${API_BASE}/sub-categories/${categoryId}`);

  if (!response.ok) {
    throw new Error("Không lấy được sub-category");
  }

  const data = await response.json();
  return [...(data.result || [])].sort((a, b) => a.id - b.id);
}

export async function searchSubCategoriesByDepartmentId(
  departmentId: number,
  page: number = 0,
  limit: number = 10
): Promise<SubCategory[]> {
  const response = await fetch(
    `${API_BASE}/sub-categories/search?page=${page}&limit=${limit}&department_id=${departmentId}`
  );

  if (!response.ok) {
    throw new Error("Không lấy được danh sách sub-category theo department");
  }

  const data = await response.json();
  return [...(data?.result?.subCategoryResponseList || [])].sort(
    (a, b) => a.id - b.id
  );
}

export function getProductImageUrl(fileName: string | null): string | null {
  if (!fileName) return null;
  return `${IMAGE_BASE}/${fileName}`;
}