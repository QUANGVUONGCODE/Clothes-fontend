import { getCategoriesByDepartmentId } from "./categoryService";
import { getSubCategoriesByCategoryId } from "./subCategoryService";

export async function getMegaMenuByDepartmentId(departmentId: number) {
  const categories = await getCategoriesByDepartmentId(departmentId);

  return await Promise.all(
    categories.map(async (category: any) => {
      const subCategories = await getSubCategoriesByCategoryId(category.id);
      return {
        ...category,
        subCategories,
      };
    })
  );
}