import { redirect } from 'next/navigation';
import { getAdminSession, adminCategoriesApi } from '@/lib/api.server';
import { ProductForm } from '@/components/admin/products/product-form';

export default async function NewProductPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  const categories = await adminCategoriesApi.getAll();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Nouveau produit</h1>
        <p className="text-muted-foreground">Remplissez les informations du produit</p>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}