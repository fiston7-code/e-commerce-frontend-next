// src/lib/auth.ts
// ← pas de 'use server' ici

import type { AdminUser } from './types';

export const AUTH_COOKIES = {
  TOKEN: 'admin_token',
  USER: 'admin_user',
} as const;

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 jours
};

// ← utilisé dans les Server Components et Server Actions
export function parseAdminUser(raw: string | undefined): AdminUser | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}