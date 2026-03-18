import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ── API routes — sin middleware ───────────────────────────────────────────
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // ── Admin login — SIEMPRE pasar, sin verificación ─────────────────────────
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login?')) {
    return NextResponse.next();
  }

  // ── Resto del admin — verificar cookie de sesión ──────────────────────────
  if (pathname.startsWith('/admin')) {
    // Verificar si existe la cookie de sesión de NextAuth v5
    const sessionToken =
      req.cookies.get('authjs.session-token')?.value ??
      req.cookies.get('__Secure-authjs.session-token')?.value ??
      req.cookies.get('next-auth.session-token')?.value ??
      req.cookies.get('__Secure-next-auth.session-token')?.value;

    if (!sessionToken) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

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
