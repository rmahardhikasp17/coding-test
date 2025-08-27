import { api, APIError } from "encore.dev/api";
import type { User } from "./list";

export interface GetUserParams {
  id: number;
}

// Retrieves a specific user by ID.
export const get = api<GetUserParams, User>(
  { expose: true, method: "GET", path: "/users/:id" },
  async (params) => {
    const response = await fetch(`https://dummyjson.com/users/${params.id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw APIError.notFound("User not found");
      }
      throw new Error("Failed to fetch user");
    }

    return await response.json();
  }
);
