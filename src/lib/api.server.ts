// src/lib/api.server.ts
import { cookies } from 'next/headers';
import { AUTH_COOKIES } from './auth';
import type { Product, Category, PaginatedResponse } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function fetcherServer<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIES.TOKEN)?.value;

  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? 'Erreur serveur');
  }

  return res.json();
}

export const adminProductsApi = {
  getAll: (params?: Record<string, string | number | boolean>) => {
    const query = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : '';
    return fetcherServer<{ items: Product[]; meta: PaginatedResponse<unknown>['meta'] }>(
      `/products${query}`,
    );
  },

  create: (data: unknown) =>
    fetcherServer<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: unknown) =>
    fetcherServer<Product>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetcherServer<void>(`/products/${id}`, {
      method: 'DELETE',
    }),
};

export const adminCategoriesApi = {
  getAll: () => fetcherServer<Category[]>('/categories'),

  create: (data: unknown) =>
    fetcherServer<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: unknown) =>
    fetcherServer<Category>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetcherServer<void>(`/categories/${id}`, {
      method: 'DELETE',
    }),
};

export const uploadApi = {
  uploadImage: async (file: File): Promise<string> => {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIES.TOKEN)?.value;

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_URL}/upload/image`, {
      method: 'POST',
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      body: formData,
    });

    if (!res.ok) throw new Error('Upload échoué');
    const data = await res.json();
    return data.url;
  },
};