import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ── API routes — sin middleware ───────────────────────────────────────────
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // ── Rutas admin — la protección se hace en cada layout/page con auth() ────
  // El middleware NO toca /admin para evitar problemas con Edge Runtime
  if (pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // ── Rutas públicas — aplicar i18n ─────────────────────────────────────────
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    '/((?!_next|_vercel|.*\\..*).*)',
  ],
};
