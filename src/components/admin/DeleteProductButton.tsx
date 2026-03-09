// ─── BOUTON SUPPRIMER ────────────────────────────────────────────────
// Client Component séparé pour gérer la confirmation
'use client';

import { useTransition } from 'react';
import { deleteProductAction } from '@/lib/actions/product.actions';
import { Button } from '@/components/ui/button';

export function DeleteProductButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm('Supprimer ce produit ?')) return;
    startTransition(() => {
      deleteProductAction(id);
    });
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
    >
      {isPending ? '...' : 'Supprimer'}
    </Button>
  );
}
