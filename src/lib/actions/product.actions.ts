'use server';

import { revalidatePath } from 'next/cache';
import { adminProductsApi } from '@/lib/api.server';

// ─── CRÉER ──────────────────────────────────────────────────────────
export async function createProductAction(_: unknown, formData: FormData) {
  try {
    const images = formData.getAll('images') as string[];

    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || undefined,
      priceUSD: Number(formData.get('priceUSD')),
      priceCDF: formData.get('priceCDF') ? Number(formData.get('priceCDF')) : undefined,
      costPrice: formData.get('costPrice') ? Number(formData.get('costPrice')) : undefined,
      stock: Number(formData.get('stock') ?? 0),
      stockThreshold: Number(formData.get('stockThreshold') ?? 5),
      brand: formData.get('brand') as string || undefined,
      categoryId: formData.get('categoryId') as string,
      isAvailable: formData.get('isAvailable') === 'true',
      images,
    };

    await adminProductsApi.create(data);
    revalidatePath('/admin/dashboard/products');
    revalidatePath('/products');

    return { success: true };

  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Erreur création produit' };
  }
}

// ─── METTRE À JOUR ───────────────────────────────────────────────────
export async function updateProductAction(
  id: string,
  _: unknown,
  formData: FormData,
) {
  try {
    const images = formData.getAll('images') as string[];

    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || undefined,
      priceUSD: Number(formData.get('priceUSD')),
      priceCDF: formData.get('priceCDF') ? Number(formData.get('priceCDF')) : undefined,
      costPrice: formData.get('costPrice') ? Number(formData.get('costPrice')) : undefined,
      stock: Number(formData.get('stock') ?? 0),
      stockThreshold: Number(formData.get('stockThreshold') ?? 5),
      brand: formData.get('brand') as string || undefined,
      categoryId: formData.get('categoryId') as string,
      isAvailable: formData.get('isAvailable') === 'true',
      images,
    };

    await adminProductsApi.update(id, data);
    revalidatePath('/admin/dashboard/products');
    revalidatePath('/products');

    return { success: true };

  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Erreur mise à jour produit' };
  }
}

// ─── SUPPRIMER ───────────────────────────────────────────────────────
export async function deleteProductAction(id: string) {
  try {
    await adminProductsApi.delete(id);
    revalidatePath('/admin/dashboard/products');
    revalidatePath('/products');

    return { success: true };

  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Erreur suppression produit' };
  }
}