import { redirect, notFound } from 'next/navigation';
import { getAdminSession, adminProductsApi, adminCategoriesApi } from '@/lib/api.server';
import { ProductForm } from '@/components/admin/products/product-form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  const { id } = await params;

  const [{ items }, categories] = await Promise.all([
    adminProductsApi.getAll({ limit: 1, page: 1 }),
    adminCategoriesApi.getAll(),
  ]);

  // Récupère le produit par id
  let product;
  try {
    product = await adminProductsApi.getById(id);
  } catch {
    notFound();
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Modifier le produit</h1>
        <p className="text-muted-foreground">{product.name}</p>
      </div>

      <ProductForm categories={categories} product={product} />
    </div>
  );
}