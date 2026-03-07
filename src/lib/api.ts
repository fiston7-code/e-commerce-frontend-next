const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? 'Erreur serveur');
  }

  return res.json();
}

// ─── PRODUCTS ────────────────────────────────────────────────────────
export const productsApi = {
  getAll: (params?: Record<string, string | number | boolean>) => {
    const query = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : '';
    return fetcher<{ items: import('./types').Product[]; meta: import('./types').PaginatedResponse<unknown>['meta'] }>(
      `/products${query}`,
      { next: { revalidate: 60 } }, // ← cache 60s Next.js
    );
  },

  getBySlug: (slug: string) =>
    fetcher<import('./types').Product>(`/products/slug/${slug}`, {
      next: { revalidate: 60 },
    }),

  getById: (id: string) =>
    fetcher<import('./types').Product>(`/products/${id}`, {
      next: { revalidate: 60 },
    }),
};

// ─── CATEGORIES ──────────────────────────────────────────────────────
export const categoriesApi = {
  getAll: () =>
    fetcher<import('./types').Category[]>('/categories', {
      next: { revalidate: 300 }, // ← cache 5min, les catégories changent peu
    }),
};