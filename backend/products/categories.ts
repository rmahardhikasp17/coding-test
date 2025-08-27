import { api } from "encore.dev/api";

export interface CategoriesResponse {
  categories: string[];
}

// Retrieves all product categories.
export const categories = api<void, CategoriesResponse>(
  { expose: true, method: "GET", path: "/products/categories" },
  async () => {
    const response = await fetch("https://dummyjson.com/products/categories");
    
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }

    const categories = await response.json();
    return { categories };
  }
);
