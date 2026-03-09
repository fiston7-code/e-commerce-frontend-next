import { redirect } from 'next/navigation';
import { getAdminSession, adminProductsApi, adminCategoriesApi } from '@/lib/api.server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { DeleteProductButton } from '@/components/admin/DeleteProductButton';

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string; categoryId?: string }>;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  const params = await searchParams;

  const { items: products, meta } = await adminProductsApi.getAll({
    page: Number(params.page ?? 1),
    limit: 20,
    ...(params.search && { search: params.search }),
    ...(params.categoryId && { categoryId: params.categoryId }),
  });

  const categories = await adminCategoriesApi.getAll();

  return (
    <div>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Produits</h1>
          <p className="text-muted-foreground">{meta.total} produit{meta.total > 1 ? 's' : ''}</p>
        </div>
        <Link href="/admin/dashboard/products/new">
          <Button>+ Nouveau produit</Button>
        </Link>
      </div>

      {/* FILTRES */}
      <div className="flex gap-2 flex-wrap mb-6">
        <Link href="/admin/dashboard/products">
          <Badge variant={!params.categoryId ? 'default' : 'outline'} className="cursor-pointer">
            Tous
          </Badge>
        </Link>
        {categories.map((cat) => (
          <Link key={cat.id} href={`/admin/dashboard/products?categoryId=${cat.id}`}>
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
      <form method="GET" action="/admin/dashboard/products" className="mb-6">
        {params.categoryId && (
          <input type="hidden" name="categoryId" value={params.categoryId} />
        )}
        <div className="flex gap-2 max-w-md">
          <input
            name="search"
            placeholder="Rechercher un produit..."
            defaultValue={params.search ?? ''}
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
          />
          <Button type="submit" variant="outline">Rechercher</Button>
        </div>
      </form>

      {/* TABLE */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Produit</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Catégorie</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Prix</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Stock</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Statut</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground">
                  Aucun produit trouvé
                </td>
              </tr>
            ) : (
              products.map((product: Product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">

                  {/* NOM + IMAGE */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                            N/A
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.brand}</p>
                      </div>
                    </div>
                  </td>

                  {/* CATEGORIE */}
                  <td className="p-4">
                    <span className="text-sm">{product.category.name}</span>
                  </td>

                  {/* PRIX */}
                  <td className="p-4">
                    <span className="text-sm font-medium">{formatPrice(product.priceUSD)}</span>
                  </td>

                  {/* STOCK */}
                  <td className="p-4">
                    <span className={`text-sm font-medium ${
                      product.stock === 0
                        ? 'text-red-600'
                        : product.stock <= product.stockThreshold
                        ? 'text-orange-600'
                        : 'text-green-600'
                    }`}>
                      {product.stock}
                    </span>
                  </td>

                  {/* STATUT */}
                  <td className="p-4">
                    <Badge variant={product.isAvailable ? 'default' : 'outline'}>
                      {product.isAvailable ? 'Disponible' : 'Indisponible'}
                    </Badge>
                  </td>

                  {/* ACTIONS */}
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/dashboard/products/${product.id}/edit`}>
                        <Button variant="outline" size="sm">Modifier</Button>
                      </Link>
                      <DeleteProductButton id={product.id} />
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: meta.totalPages }).map((_, i) => (
            <Link
              key={i}
              href={`/admin/dashboard/products?page=${i + 1}${params.categoryId ? `&categoryId=${params.categoryId}` : ''}${params.search ? `&search=${params.search}` : ''}`}
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

    </div>
  );
}

