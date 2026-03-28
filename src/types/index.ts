export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  expiresIn: string;
}

export interface Variant {
  id: string;
  productId: string;
  attributes: Record<string, string>;
  combinationKey: string;
  price: number | null;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  isActive: boolean;
  variants: Variant[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface ApiError {
  statusCode: number;
  type: string;
  message: string;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  basePrice: number;
  isActive?: boolean;
  variants?: CreateVariantPayload[];
}

export interface CreateVariantPayload {
  attributes: Record<string, string>;
  price?: number;
  stock?: number;
}

export interface UpdateVariantPayload {
  price?: number;
  stock?: number;
  isActive?: boolean;
}
