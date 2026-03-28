import client from './client';
import type {
  ApiResponse,
  Product,
  CreateProductPayload,
  Variant,
  CreateVariantPayload,
  UpdateVariantPayload,
} from '@/types';

export async function getProducts(): Promise<Product[]> {
  const { data } = await client.get<ApiResponse<Product[]>>('/products');
  return data.data;
}

export async function getProduct(id: string): Promise<Product> {
  const { data } = await client.get<ApiResponse<Product>>(`/products/${id}`);
  return data.data;
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  const { data } = await client.post<ApiResponse<Product>>('/products', payload);
  return data.data;
}

export async function updateProduct(
  id: string,
  payload: Partial<Pick<Product, 'name' | 'description' | 'basePrice' | 'isActive'>>,
): Promise<Product> {
  const { data } = await client.patch<ApiResponse<Product>>(`/products/${id}`, payload);
  return data.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await client.delete(`/products/${id}`);
}

export async function addVariant(productId: string, payload: CreateVariantPayload): Promise<Variant> {
  const { data } = await client.post<ApiResponse<Variant>>(`/products/${productId}/variants`, payload);
  return data.data;
}

export async function updateVariant(
  productId: string,
  variantId: string,
  payload: UpdateVariantPayload,
): Promise<Variant> {
  const { data } = await client.patch<ApiResponse<Variant>>(
    `/products/${productId}/variants/${variantId}`,
    payload,
  );
  return data.data;
}

export async function deleteVariant(productId: string, variantId: string): Promise<void> {
  await client.delete(`/products/${productId}/variants/${variantId}`);
}
