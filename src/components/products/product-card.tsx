import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export function ProductCard({ product }: ProductCardProps) {
  const isLowStock = product.stock <= product.stockThreshold && product.stock > 0;
  const isOutOfStock = product.stock === 0;

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
        
        {/* IMAGE */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Pas d&apos;image
            </div>
          )}

          {/* BADGES */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isOutOfStock && (
              <Badge variant="destructive">Rupture de stock</Badge>
            )}
            {isLowStock && (
              <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                Stock limité
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          {/* CATEGORIE */}
          <p className="text-xs text-muted-foreground mb-1">
            {product.category.name}
          </p>

          {/* NOM */}
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-1">
            {product.name}
          </h3>

          {/* MARQUE */}
          {product.brand && (
            <p className="text-xs text-muted-foreground">{product.brand}</p>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <span className="font-bold text-lg">
            {formatPrice(product.priceUSD)}
          </span>
          {product.priceCDF && (
            <span className="text-xs text-muted-foreground">
              {new Intl.NumberFormat('fr-CD').format(product.priceCDF)} CDF
            </span>
          )}
        </CardFooter>

      </Card>
    </Link>
  );
}