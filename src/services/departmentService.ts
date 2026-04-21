import type { Department } from "../types/menu";

const API_BASE = "/shopclothes/api/v1";

export async function getDepartments(): Promise<Department[]> {
  const response = await fetch(`${API_BASE}/departments`);

  if (!response.ok) {
    throw new Error("Không lấy được department");
  }

  const data = await response.json();
  return [...(data.result || [])].sort((a, b) => a.id - b.id);
}