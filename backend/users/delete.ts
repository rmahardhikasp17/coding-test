import { api, APIError } from "encore.dev/api";

export interface DeleteUserParams {
  id: number;
}

export interface DeleteUserResponse {
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
  isDeleted: boolean;
  deletedOn: string;
}

// Deletes a user.
export const deleteUser = api<DeleteUserParams, DeleteUserResponse>(
  { expose: true, method: "DELETE", path: "/users/:id" },
  async (params) => {
    const response = await fetch(`https://dummyjson.com/users/${params.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw APIError.notFound("User not found");
      }
      throw new Error("Failed to delete user");
    }

    return await response.json();
  }
);
