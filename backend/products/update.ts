import { api, APIError } from "encore.dev/api";
import type { Product } from "./list";

export interface UpdateProductParams {
  id: number;
}

export interface UpdateProductRequest {
  title?: string;
  description?: string;
  category?: string;
  price?: number;
  discountPercentage?: number;
  stock?: number;
  brand?: string;
  sku?: string;
  weight?: number;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  thumbnail?: string;
  images?: string[];
}

// Updates an existing product.
export const update = api<UpdateProductParams & UpdateProductRequest, Product>(
  { expose: true, method: "PUT", path: "/products/:id" },
  async (req) => {
    const { id, ...updateData } = req;
    
    const response = await fetch(`https://dummyjson.com/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw APIError.notFound("Product not found");
      }
      throw new Error("Failed to update product");
    }

    return await response.json();
  }
);
