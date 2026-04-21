export interface Department {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  department?: Department;
  departments?: Department;
}

export interface SubCategory {
  id: number;
  name: string;
  thumbnail?: string | null;
  category?: {
    id: number;
    name: string;
    department?: Department;
  };
}

export interface CategoryWithSubs extends Category {
  subCategories: SubCategory[];
}