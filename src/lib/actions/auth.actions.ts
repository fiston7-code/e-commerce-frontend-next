'use server';
// ← Ce fichier tourne UNIQUEMENT côté serveur
// Jamais exposé au navigateur

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_COOKIES, COOKIE_OPTIONS } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function loginAction(_: unknown, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email et mot de passe requis' };
  }

  try {
    // 1. Appelle le backend NestJS
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { error: data.message ?? 'Identifiants invalides' };
    }

    const data = await res.json() as {
      accessToken: string;
      user: unknown;
    };
    const cookieStore = await cookies();

    // 2. Stocke le JWT — httpOnly = JS client ne peut pas le lire
    cookieStore.set(AUTH_COOKIES.TOKEN, data.accessToken, {
      ...COOKIE_OPTIONS,
      secure: false, // ← false en dev
    });

    // 3. Stocke les infos admin — httpOnly: false = lisible côté client
    cookieStore.set(AUTH_COOKIES.USER, JSON.stringify(data.user), {
      ...COOKIE_OPTIONS,
      httpOnly: false,
      secure: false,
    });

    return { success: true }; // ← retourne au composant client

  } catch {
    return { error: 'Erreur serveur, réessayez' };
  }
  // ← pas de redirect ici — géré dans le composant avec router.push()
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIES.TOKEN);
  cookieStore.delete(AUTH_COOKIES.USER);
  redirect('/admin/login'); // ← redirect OK ici car pas de RHF
}