import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Endpoint de diagnóstico — verifica cada paso del proceso de auth
export async function POST(req: NextRequest) {
  const { email, password, setupKey } = await req.json();

  if (setupKey !== (process.env.SETUP_KEY ?? 'setup-andrew-myer-2026')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const steps: Record<string, unknown> = {};

  // 1. Buscar admin en BD
  const admin = await prisma.adminUser.findUnique({ where: { email } });
  steps.adminFound = !!admin;
  steps.adminEmail = admin?.email ?? 'not found';
  steps.hasHash    = !!admin?.passwordHash;
  steps.hashPrefix = admin?.passwordHash?.slice(0, 7) ?? 'none';

  // 2. Verificar contraseña
  if (admin?.passwordHash) {
    const valid = await bcrypt.compare(password, admin.passwordHash);
    steps.passwordValid = valid;
  } else {
    steps.passwordValid = false;
  }

  // 3. Verificar env vars
  steps.hasAuthSecret   = !!process.env.AUTH_SECRET;
  steps.hasNextauthUrl  = !!process.env.NEXTAUTH_URL;
  steps.hasDatabaseUrl  = !!process.env.DATABASE_URL;
  steps.nodeEnv         = process.env.NODE_ENV;

  return NextResponse.json(steps);
}
