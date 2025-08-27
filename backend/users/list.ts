import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  maidenName: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  birthDate: string;
  image: string;
  bloodGroup: string;
  height: number;
  weight: number;
  eyeColor: string;
  hair: {
    color: string;
    type: string;
  };
  ip: string;
  address: {
    address: string;
    city: string;
    state: string;
    stateCode: string;
    postalCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    country: string;
  };
  macAddress: string;
  university: string;
  bank: {
    cardExpire: string;
    cardNumber: string;
    cardType: string;
    currency: string;
    iban: string;
  };
  company: {
    department: string;
    name: string;
    title: string;
    address: {
      address: string;
      city: string;
      state: string;
      stateCode: string;
      postalCode: string;
      coordinates: {
        lat: number;
        lng: number;
      };
      country: string;
    };
  };
  ein: string;
  ssn: string;
  userAgent: string;
  crypto: {
    coin: string;
    wallet: string;
    network: string;
  };
  role: string;
}

export interface ListUsersParams {
  limit?: Query<number>;
  skip?: Query<number>;
  search?: Query<string>;
  sortBy?: Query<string>;
  order?: Query<string>;
}

export interface ListUsersResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}

// Retrieves all users with pagination, search, and filtering.
export const list = api<ListUsersParams, ListUsersResponse>(
  { expose: true, method: "GET", path: "/users" },
  async (params) => {
    const searchParams = new URLSearchParams();
    
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.skip) searchParams.set("skip", params.skip.toString());
    if (params.search) searchParams.set("q", params.search);
    if (params.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params.order) searchParams.set("order", params.order);

    const url = params.search 
      ? `https://dummyjson.com/users/search?${searchParams.toString()}`
      : `https://dummyjson.com/users?${searchParams.toString()}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    return await response.json();
  }
);
