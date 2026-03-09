'use client';

import { type Resolver, type SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { createProductAction, updateProductAction } from '@/lib/actions/product.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Category, Product } from '@/lib/types';

// ─── SCHEMA ZOD ─────────────────────────────────────────────────────
const productSchema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères').max(100),
  description: z.string().optional(),
  priceUSD: z.coerce.number().min(0, 'Prix invalide'),
  priceCDF: z.coerce.number().min(0).optional(),
  costPrice: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().min(0).default(0),
  stockThreshold: z.coerce.number().min(0).default(5),
  brand: z.string().optional(),
  categoryId: z.string().min(1, 'Catégorie requise'),
  isAvailable: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productSchema>;

// ─── PROPS ──────────────────────────────────────────────────────────
interface ProductFormProps {
  categories: Category[];
  product?: Product; // ← si fourni → mode édition
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const isEditing = !!product;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormValues>,
    defaultValues: {
      name: product?.name ?? '',
      description: product?.description ?? '',
      priceUSD: product?.priceUSD ?? 0,
      priceCDF: product?.priceCDF ?? undefined,
      costPrice: product?.costPrice ?? undefined,
      stock: product?.stock ?? 0,
      stockThreshold: product?.stockThreshold ?? 5,
      brand: product?.brand ?? '',
      categoryId: product?.categoryId ?? '',
      isAvailable: product?.isAvailable ?? true,
    },
  });

  // ─── UPLOAD FICHIER ────────────────────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Appelle directement l'API upload avec le cookie
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload échoué');
      const data = await res.json();
      setImages((prev) => [...prev, data.url]);
    } catch {
      setServerError('Erreur upload image');
    } finally {
      setUploading(false);
    }
  };

  // ─── AJOUTER URL EXTERNE ──────────────────────────────────────────
  const handleAddUrl = () => {
    if (!imageUrl.trim()) return;
    try {
      new URL(imageUrl); // ← valide l'URL
      setImages((prev) => [...prev, imageUrl]);
      setImageUrl('');
    } catch {
      setServerError('URL invalide');
    }
  };

  // ─── SUPPRIMER IMAGE ──────────────────────────────────────────────
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── SUBMIT ───────────────────────────────────────────────────────
  const onSubmit: SubmitHandler<ProductFormValues> = async (values) => {
    setServerError(null);

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        formData.append(key, String(value));
      }
    });
    images.forEach((url) => formData.append('images', url));

    startTransition(async () => {
      const result = isEditing
        ? await updateProductAction(product.id, undefined, formData)
        : await createProductAction(undefined, formData);

      if (result?.error) {
        setServerError(result.error);
        return;
      }

      router.push('/admin/dashboard/products');
      router.refresh();
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">

      {serverError && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
          {serverError}
        </div>
      )}

      {/* INFOS PRINCIPALES */}
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-lg">Informations principales</h2>

        <div className="space-y-1">
          <label className="text-sm font-medium">Nom *</label>
          <Input placeholder="iPhone 15 Pro" {...form.register('name')} />
          {form.formState.errors.name && (
            <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Description</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm min-h-24 resize-none"
            placeholder="Description du produit..."
            {...form.register('description')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Marque</label>
            <Input placeholder="Apple" {...form.register('brand')} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Catégorie *</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              {...form.register('categoryId')}
            >
              <option value="">Sélectionner...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {form.formState.errors.categoryId && (
              <p className="text-red-500 text-xs">{form.formState.errors.categoryId.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* PRIX */}
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-lg">Prix</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Prix USD (centimes) *</label>
            <Input type="number" placeholder="99900" {...form.register('priceUSD')} />
            {form.formState.errors.priceUSD && (
              <p className="text-red-500 text-xs">{form.formState.errors.priceUSD.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Prix CDF</label>
            <Input type="number" placeholder="285000" {...form.register('priceCDF')} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Prix d&apos;achat</label>
            <Input type="number" placeholder="75000" {...form.register('costPrice')} />
          </div>
        </div>
      </div>

      {/* STOCK */}
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-lg">Stock</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Quantité en stock</label>
            <Input type="number" {...form.register('stock')} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Seuil d&apos;alerte</label>
            <Input type="number" {...form.register('stockThreshold')} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isAvailable"
            {...form.register('isAvailable')}
            className="w-4 h-4"
          />
          <label htmlFor="isAvailable" className="text-sm font-medium">
            Produit disponible à la vente
          </label>
        </div>
      </div>

      {/* IMAGES */}
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-lg">Images</h2>

        {/* Upload fichier */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Uploader un fichier</label>
          <Input
            type="file"
            accept="image/jpg,image/jpeg,image/png,image/webp"
            onChange={handleFileUpload}
            disabled={uploading || images.length >= 5}
          />
          {uploading && <p className="text-xs text-muted-foreground">Upload en cours...</p>}
        </div>

        {/* URL externe */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Ou coller une URL</label>
          <div className="flex gap-2">
            <Input
              placeholder="https://exemple.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={images.length >= 5}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddUrl}
              disabled={images.length >= 5}
            >
              Ajouter
            </Button>
          </div>
        </div>

        {/* Preview images */}
        {images.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {images.map((url, i) => (
              <div key={i} className="relative group">
                <img
                  src={url}
                  alt={`Image ${i + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
                {i === 0 && (
                  <Badge className="absolute bottom-1 left-1 text-xs px-1 py-0">
                    Principal
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer le produit'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Annuler
        </Button>
      </div>

    </form>
  );
}