import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { productsApi } from '@/lib/api';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const product = await productsApi.getBySlug(slug).catch(() => notFound());

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock <= product.stockThreshold && product.stock > 0;

  return (
    <main className="container mx-auto px-4 py-8">

      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:underline">Accueil</Link>
        <span>/</span>
        <Link href="/products" className="hover:underline">Produits</Link>
        <span>/</span>
        <Link
          href={`/products?categoryId=${product.categoryId}`}
          className="hover:underline"
        >
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* IMAGES */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Pas d'image
              </div>
            )}
          </div>

          {/* MINIATURES */}
          {product.images.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {product.images.map((img, i) => (
                <div
                  key={i}
                  className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border-2 border-transparent hover:border-primary cursor-pointer"
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* INFOS */}
        <div className="space-y-6">

          {/* CATEGORIE + MARQUE */}
          <div className="flex items-center gap-2">
            <Badge variant="outline">{product.category.name}</Badge>
            {product.brand && (
              <Badge variant="secondary">{product.brand}</Badge>
            )}
          </div>

          {/* NOM */}
          <h1 className="text-3xl font-bold">{product.name}</h1>

          {/* PRIX */}
          <div className="space-y-1">
            <p className="text-4xl font-bold text-primary">
              {formatPrice(product.priceUSD)}
            </p>
            {product.priceCDF && (
              <p className="text-muted-foreground">
                {new Intl.NumberFormat('fr-CD').format(product.priceCDF)} CDF
              </p>
            )}
          </div>

          {/* STOCK */}
          <div>
            {isOutOfStock && (
              <Badge variant="destructive" className="text-sm">
                Rupture de stock
              </Badge>
            )}
            {isLowStock && (
              <Badge variant="outline" className="text-sm bg-orange-100 text-orange-700 border-orange-300">
                Plus que {product.stock} en stock
              </Badge>
            )}
            {!isOutOfStock && !isLowStock && (
              <Badge variant="outline" className="text-sm bg-green-100 text-green-700 border-green-300">
                En stock ({product.stock} disponibles)
              </Badge>
            )}
          </div>

          {/* DESCRIPTION */}
          {product.description && (
            <div>
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* SPECIFICATIONS */}
          {product.specifications && (
            <div>
              <h2 className="font-semibold mb-3">Caractéristiques</h2>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b text-sm">
                    <span className="text-muted-foreground capitalize">{key}</span>
                    <span className="font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-3 pt-4">
            <Button size="lg" className="flex-1" disabled={isOutOfStock}>
              {isOutOfStock ? 'Indisponible' : 'Commander'}
            </Button>
            <Button size="lg" variant="outline">
              Contacter via WhatsApp
            </Button>
          </div>

        </div>
      </div>

    </main>
  );
}
