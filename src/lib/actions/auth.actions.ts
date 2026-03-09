'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_COOKIES, COOKIE_OPTIONS } from '@/lib/auth'; // ← parseAdminUser retiré

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function loginAction(_: unknown, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email et mot de passe requis' };
  }

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { error: data.message ?? 'Identifiants invalides' };
    }

    const data = await res.json();
    const cookieStore = await cookies();

    cookieStore.set(AUTH_COOKIES.TOKEN, data.accessToken, COOKIE_OPTIONS);
    cookieStore.set(AUTH_COOKIES.USER, JSON.stringify(data.admin), {
      ...COOKIE_OPTIONS,
      httpOnly: false,
    });

  } catch {
    return { error: 'Erreur serveur, réessayez' };
  }

  redirect('/admin/dashboard');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIES.TOKEN);
  cookieStore.delete(AUTH_COOKIES.USER);
  redirect('/admin/login');
}