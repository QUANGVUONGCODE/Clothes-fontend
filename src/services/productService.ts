const API_BASE = "/shopclothes/api/v1";
const IMAGE_BASE = `${API_BASE}/product-images/images`;

export async function searchProductsByKeyword(
  keyword: string,
  limit: number = 10
) {
  const response = await fetch(
    `${API_BASE}/products/search?keyword=${encodeURIComponent(keyword)}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error("Không lấy được danh sách sản phẩm");
  }

  const data = await response.json();
  console.log("product search data =", data);

  return data?.result?.productResponseLists || [];
}

export function getProductImageUrl(fileName: string | null): string | null {
  if (!fileName) return null;
  return `${IMAGE_BASE}/${fileName}`;
}

export async function getProductsByDepartmentId(departmentId: number) {
  const response = await fetch(
    `${API_BASE}/products/department?department_id=${departmentId}`
  );

  if (!response.ok) {
    throw new Error("Không lấy được sản phẩm theo department");
  }

  const data = await response.json();
  return data?.result?.productResponseLists || [];
}

export async function getProductsBySubCategoryId(subCategoryId: number) {
  const response = await fetch(
    `${API_BASE}/products/subCategory?subcategory_id=${subCategoryId}`
  );

  if (!response.ok) {
    throw new Error("Không lấy được sản phẩm theo sub-category");
  }

  const data = await response.json();
  return data?.result?.productResponseLists || [];
}


export async function getProductVariantsByProductId(productId: number) {
  const response = await fetch(
    `${API_BASE}/product-variants/search?product_id=${productId}`
  );

  if (!response.ok) {
    throw new Error("Không lấy được variant của sản phẩm");
  }

  const data = await response.json();
  return data?.result?.productVariantResponseList || [];
}

export async function getProductImagesByProductIdAndColorId(
  productId: number,
  colorId: number
) {
  const response = await fetch(
    `${API_BASE}/product-images?productId=${productId}&colorId=${colorId}`
  );

  if (!response.ok) {
    throw new Error("Không lấy được ảnh sản phẩm theo màu");
  }

  const data = await response.json();
  return data?.result || [];
}


export async function getProductById(productId: number) {
  const response = await fetch(`${API_BASE}/products/news/${productId}`);

  if (!response.ok) {
    throw new Error("Không lấy được thông tin sản phẩm");
  }

  const data = await response.json();
  return data?.result || null;
}

export async function getProductsByCategoryId(categoryId: number) {
  const url = `${API_BASE}/products/categoryId?category_id=${categoryId}`;
  console.log("getProductsByCategoryId URL =", url);

  const response = await fetch(url);
  console.log("getProductsByCategoryId status =", response.status);

  if (!response.ok) {
    throw new Error("Không lấy được sản phẩm theo category");
  }

  const data = await response.json();
  console.log("getProductsByCategoryId data =", data);

  return data?.result?.productResponseLists || [];
}

export async function searchProductsByImage(imageFile: File): Promise<any[]> {
  if (!imageFile) {
    throw new Error("Image file is required");
  }

  const formData = new FormData();
  formData.append("image", imageFile);

  console.log("Calling image search API with file:", imageFile.name, "- NO HEADERS - via proxy");
  const response = await fetch(`${API_BASE}/product-images/search-by-image`, {
    method: "POST",
    credentials: 'include',
    body: formData,
  });
  console.log("Image search response status:", response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Full error response:", errorText);
    throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
  }

  const data = await response.json();
  console.log("image search data =", data);

  return data?.result || [];
}


