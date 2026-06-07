import { NextResponse } from 'next/server';

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

const AUTH_ONLY = ['/login', '/register', '/mot-de-passe-oublie'];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('guyagod_token')?.value;

  const isProtected = PROTECTED.some(p => pathname.startsWith(p));
  const isAuthOnly  = AUTH_ONLY.some(p => pathname.startsWith(p));

  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthOnly && token) {
    const url = request.nextUrl.clone();
    url.pathname = '/catalogue';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
