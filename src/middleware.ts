import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import { getToken } from 'next-auth/jwt';

const intlMiddleware = createMiddleware(routing);

// Rutas admin que NO requieren autenticación
const PUBLIC_ADMIN_PATHS = ['/admin/login'];

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ── Rutas admin ──────────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    // Dejar pasar la página de login siempre (evita redirect loop)
    if (PUBLIC_ADMIN_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
      return NextResponse.next();
    }

    // Verificar sesión para el resto del admin
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    });

    if (!token || token.role !== 'ADMIN') {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // ── API routes — sin middleware ───────────────────────────────────────────
  if (pathname.startsWith('/api')) {
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
