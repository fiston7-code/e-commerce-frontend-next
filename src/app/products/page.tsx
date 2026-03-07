import { Suspense } from 'react';
import Link from 'next/link'; // ← ajoute cet import
import { productsApi, categoriesApi } from '@/lib/api';
import { ProductGrid } from '@/components/products/product-grid';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ProductCardSkeleton } from '@/components/products/product-card-skeleton';
import type { ProductQuery } from '@/lib/types';

interface PageProps {
  searchParams: Promise<ProductQuery & { categoryId?: string }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const [{ items: products, meta }, categories] = await Promise.all([
    productsApi.getAll({
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      ...(params.search && { search: params.search }),
      ...(params.categoryId && { categoryId: params.categoryId }),
      isAvailable: true,
    }),
    categoriesApi.getAll(),
  ]);

  return (
    <main className="container mx-auto px-4 py-8">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Nos Produits</h1>
        <p className="text-muted-foreground">
          {meta.total} produit{meta.total > 1 ? 's' : ''} disponible{meta.total > 1 ? 's' : ''}
        </p>
      </div>

      {/* FILTRES CATEGORIES */}
      <div className="flex gap-2 flex-wrap mb-6">
        <Link href="/products">
          <Badge variant={!params.categoryId ? 'default' : 'outline'} className="cursor-pointer">
            Tous
          </Badge>
        </Link>
        {categories.map((cat) => (
          <Link key={cat.id} href={`/products?categoryId=${cat.id}`}>
            <Badge
              variant={params.categoryId === cat.id ? 'default' : 'outline'}
              className="cursor-pointer"
            >
              {cat.name}
            </Badge>
          </Link>
        ))}
      </div>

      {/* SEARCH */}
      <form className="mb-8" method="GET" action="/products">
        {params.categoryId && (
          <input type="hidden" name="categoryId" value={params.categoryId} />
        )}
        <Input
          name="search"
          placeholder="Rechercher un produit..."
          defaultValue={(params.search as string) ?? ''}
          className="max-w-md"
        />
      </form>

      {/* GRILLE PRODUITS */}
      <Suspense
        fallback={
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <ProductGrid products={products} />
      </Suspense>

      {/* PAGINATION */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: meta.totalPages }).map((_, i) => (
            <Link
              key={i}
              href={`/products?page=${i + 1}${params.categoryId ? `&categoryId=${params.categoryId}` : ''}${params.search ? `&search=${params.search}` : ''}`}
            >
              <Badge
                variant={meta.page === i + 1 ? 'default' : 'outline'}
                className="cursor-pointer w-8 h-8 flex items-center justify-center"
              >
                {i + 1}
              </Badge>
            </Link>
          ))}
        </div>
      )}

    </main>
  );
}