// middleware.js — À placer à la RACINE du projet Next.js (même niveau que package.json)
// C'est la VRAIE solution au problème de déconnexion au refresh
// Le middleware s'exécute côté serveur AVANT le rendu de la page
// Il vérifie si l'utilisateur est connecté via un cookie (pas localStorage)

import { NextResponse } from 'next/server';

// Routes qui nécessitent d'être connecté
const PROTECTED = [
  '/profil',
  '/commandes',
  '/favoris',
  '/messages',
  '/notifications',
  '/panier',
  '/commande',
  '/admin',
  '/vendeur',
];

// Routes uniquement pour non-connectés
const AUTH_ONLY = ['/login', '/register', '/mot-de-passe-oublie'];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Lire le token depuis les cookies (pas localStorage — inaccessible côté serveur)
  const token = request.cookies.get('guyagod_token')?.value;

  const isProtected = PROTECTED.some(p => pathname.startsWith(p));
  const isAuthOnly  = AUTH_ONLY.some(p => pathname.startsWith(p));

  // Page protégée sans token → redirect vers login
  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Page auth (login/register) avec token → redirect vers catalogue
  if (isAuthOnly && token) {
    const url = request.nextUrl.clone();
    url.pathname = '/catalogue';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Appliquer sur toutes les routes sauf fichiers statiques et API
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
