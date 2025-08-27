import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand: string;
  sku: string;
  weight: number;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: {
    rating: number;
    comment: string;
    date: string;
    reviewerName: string;
    reviewerEmail: string;
  }[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: {
    createdAt: string;
    updatedAt: string;
    barcode: string;
    qrCode: string;
  };
  images: string[];
  thumbnail: string;
}

export interface ListProductsParams {
  limit?: Query<number>;
  skip?: Query<number>;
  search?: Query<string>;
  category?: Query<string>;
  sortBy?: Query<string>;
  order?: Query<string>;
}

export interface ListProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

// Retrieves all products with pagination, search, and filtering.
export const list = api<ListProductsParams, ListProductsResponse>(
  { expose: true, method: "GET", path: "/products" },
  async (params) => {
    const searchParams = new URLSearchParams();
    
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.skip) searchParams.set("skip", params.skip.toString());
    if (params.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params.order) searchParams.set("order", params.order);

    let url: string;
    
    if (params.search) {
      searchParams.set("q", params.search);
      url = `https://dummyjson.com/products/search?${searchParams.toString()}`;
    } else if (params.category) {
      url = `https://dummyjson.com/products/category/${params.category}?${searchParams.toString()}`;
    } else {
      url = `https://dummyjson.com/products?${searchParams.toString()}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    return await response.json();
  }
);
