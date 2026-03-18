import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const { setupKey, newPassword, newEmail } = await req.json();

  if (setupKey !== (process.env.SETUP_KEY ?? 'setup-andrew-myer-2026')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admins = await prisma.adminUser.findMany({
    select: { id: true, email: true, name: true, createdAt: true },
  });

  if (newPassword && admins.length > 0) {
    const hash = await bcrypt.hash(newPassword, 12);
    const updatedEmail = newEmail ?? admins[0].email;
    await prisma.adminUser.update({
      where: { id: admins[0].id },
      data: { passwordHash: hash, email: updatedEmail },
    });
    return NextResponse.json({
      success: true,
      email: updatedEmail,
      password: newPassword,
    });
  }

  return NextResponse.json({ admins });
}
