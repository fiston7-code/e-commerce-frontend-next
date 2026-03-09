'use server';

import { revalidatePath } from 'next/cache';
import { adminCategoriesApi } from '@/lib/api.server';

// ─── CRÉER ──────────────────────────────────────────────────────────
export async function createCategoryAction(_: unknown, formData: FormData) {
  try {
    const data = {
      name: formData.get('name') as string,
      image: formData.get('image') as string || undefined,
    };

    if (!data.name) {
      return { error: 'Le nom est requis' };
    }

    await adminCategoriesApi.create(data);
    revalidatePath('/admin/dashboard/categories');
    revalidatePath('/products');

    return { success: true };

  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Erreur création catégorie' };
  }
}

// ─── METTRE À JOUR ───────────────────────────────────────────────────
export async function updateCategoryAction(
  id: string,
  _: unknown,
  formData: FormData,
) {
  try {
    const data = {
      name: formData.get('name') as string || undefined,
      image: formData.get('image') as string || undefined,
    };

    await adminCategoriesApi.update(id, data);
    revalidatePath('/admin/dashboard/categories');
    revalidatePath('/products');

    return { success: true };

  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Erreur mise à jour catégorie' };
  }
}

// ─── SUPPRIMER ───────────────────────────────────────────────────────
export async function deleteCategoryAction(id: string) {
  try {
    await adminCategoriesApi.delete(id);
    revalidatePath('/admin/dashboard/categories');
    revalidatePath('/products');

    return { success: true };

  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Erreur suppression catégorie' };
  }
}
