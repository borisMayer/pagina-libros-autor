import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Rutas que NO deben pasar por el middleware de i18n
const BYPASS_PATHS = [
  '/admin',
  '/auth-admin',
  '/api',
];

export default function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Dejar pasar sin i18n: admin, auth-admin, api
  if (BYPASS_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  // Rutas públicas → aplicar i18n
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    '/((?!_next|_vercel|.*\\..*).*)',
  ],
};
