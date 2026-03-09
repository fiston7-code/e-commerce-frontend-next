// Ce fichier intercepte TOUTES les requêtes vers /admin/*
// avant même que Next.js charge la page

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIES } from '@/lib/auth';

export default function proxy(request: NextRequest) {
  // Lit le cookie depuis la requête HTTP
  const token = request.cookies.get(AUTH_COOKIES.TOKEN)?.value;

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/admin/login';

  // Pas de token → redirige vers login
  if (isAdminRoute && !isLoginPage && !token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Déjà connecté → redirige vers dashboard
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next(); // ← laisse passer
}

export const config = {
  matcher: ['/admin/:path*'], // ← s'applique uniquement à /admin/*
};