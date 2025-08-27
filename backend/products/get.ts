import { api, APIError } from "encore.dev/api";
import type { Product } from "./list";

export interface GetProductParams {
  id: number;
}

// Retrieves a specific product by ID.
export const get = api<GetProductParams, Product>(
  { expose: true, method: "GET", path: "/products/:id" },
  async (params) => {
    const response = await fetch(`https://dummyjson.com/products/${params.id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw APIError.notFound("Product not found");
      }
      throw new Error("Failed to fetch product");
    }

    return await response.json();
  }
);
