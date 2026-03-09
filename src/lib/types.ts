export interface Category {
    id: string;
    name: string;
    slug: string;
    image?: string;
  }
  
  export interface Product {
    id: string;
    name: string;
    slug: string;
    description?: string;
    priceUSD: number;
    priceCDF?: number;
    costPrice?: number;
    stock: number;
    stockThreshold: number;
    images: string[];
    brand?: string;
    specifications?: Record<string, unknown>;
    isAvailable: boolean;
    categoryId: string;
    category: { name: string; slug: string };
    createdAt: string;
    updatedAt: string;
  }
  
  export interface PaginatedResponse<T> {
    items: T[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }
  
  export interface ProductQuery {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    isAvailable?: boolean;
  }

  export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'MANAGER' | 'AGENT';
  }
  
  export interface LoginResponse {
    accessToken: string;
    admin: AdminUser;
  }