import { api, APIError } from "encore.dev/api";

export interface DeleteProductParams {
  id: number;
}

export interface DeleteProductResponse {
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
  isDeleted: boolean;
  deletedOn: string;
}

// Deletes a product.
export const deleteProduct = api<DeleteProductParams, DeleteProductResponse>(
  { expose: true, method: "DELETE", path: "/products/:id" },
  async (params) => {
    const response = await fetch(`https://dummyjson.com/products/${params.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw APIError.notFound("Product not found");
      }
      throw new Error("Failed to delete product");
    }

    return await response.json();
  }
);
