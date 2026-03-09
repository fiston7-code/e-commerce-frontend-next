// Server Component — page d'accueil du dashboard
// Affiche les stats en temps réel depuis le backend

import { redirect } from 'next/navigation';
import { getAdminSession, adminProductsApi, adminCategoriesApi } from '@/lib/api.server';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  // Récupère les stats en parallèle — une seule aller-retour réseau
  const [{ meta: productsMeta }, categories] = await Promise.all([
    adminProductsApi.getAll({ limit: 1 }), // ← limit: 1 pour juste avoir le total
    adminCategoriesApi.getAll(),
  ]);

  const stats = [
    {
      label: 'Produits',
      value: productsMeta.total,
      href: '/admin/dashboard/products',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Catégories',
      value: categories.length,
      href: '/admin/dashboard/categories',
      color: 'bg-green-50 text-green-700',
    },
  ];

  return (
    <div>

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Bonjour, {session.admin.name} 👋
        </h1>
        <p className="text-muted-foreground">
          Bienvenue dans votre tableau de bord
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl p-6 border hover:shadow-md transition-shadow"
          >
            <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
            <p className="text-3xl font-bold">{stat.value}</p>
          </Link>
        ))}
      </div>

    </div>
  );
}
