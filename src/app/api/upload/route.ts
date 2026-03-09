import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIES } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    // 1. Récupère le token depuis les cookies
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIES.TOKEN)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // 2. Récupère le fichier depuis la requête
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });
    }

    // 3. Proxifie vers le backend NestJS
    const backendForm = new FormData();
    backendForm.append('file', file);

    const res = await fetch(`${API_URL}/upload/image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // ← PAS de Content-Type ici — FormData le gère automatiquement
      },
      body: backendForm,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: error.message ?? 'Upload échoué' },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ url: data.url });

  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
