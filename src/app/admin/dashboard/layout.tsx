// Server Component — tourne côté serveur
// Vérifie la session à chaque requête vers /admin/dashboard/*
// Si pas de session → redirect vers login
// Si session → affiche la sidebar avec les infos admin

import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/api.server';
import { logoutAction } from '@/lib/actions/auth.actions';
import { siteConfig } from '@/config/site';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // getAdminSession lit les cookies côté serveur
  // et retourne { admin, token } ou null
  const session = await getAdminSession();

  // Double vérification après le middleware
  if (!session) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r shadow-sm flex flex-col">

        {/* LOGO + ADMIN INFO */}
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold">{siteConfig.name}</h1>
          <p className="text-sm font-medium mt-2">{session.admin.name}</p>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            {session.admin.role}
          </span>
        </div>

        {/* NAVIGATION — vient de siteConfig, un seul endroit à modifier */}
        <nav className="flex-1 p-4 space-y-1">
          {siteConfig.adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* LOGOUT — Server Action directement dans le form */}
        <div className="p-4 border-t">
          <form action={logoutAction}>
            <Button variant="outline" className="w-full" type="submit">
              Se déconnecter
            </Button>
          </form>
        </div>

      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="ml-64 flex-1 p-8 min-h-screen">
        {children} {/* ← page.tsx s'affiche ici */}
      </main>

    </div>
  );
}