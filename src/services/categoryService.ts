import type { Category } from "../types/menu";

const API_BASE = "/shopclothes/api/v1";

export async function getCategoriesByDepartmentId(
  departmentId: number
): Promise<Category[]> {
  const response = await fetch(`${API_BASE}/categories/${departmentId}`);

  if (!response.ok) {
    throw new Error("Không lấy được category");
  }

  const data = await response.json();
  return [...(data.result || [])].sort((a, b) => a.id - b.id);
}