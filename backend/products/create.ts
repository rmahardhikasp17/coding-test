import { api } from "encore.dev/api";
import type { Product } from "./list";

export interface CreateProductRequest {
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage?: number;
  stock: number;
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

// Creates a new product.
export const create = api<CreateProductRequest, Product>(
  { expose: true, method: "POST", path: "/products" },
  async (req) => {
    const response = await fetch("https://dummyjson.com/products/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });

    if (!response.ok) {
      throw new Error("Failed to create product");
    }

    return await response.json();
  }
);
