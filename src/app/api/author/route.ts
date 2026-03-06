import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  const author = await prisma.author.findFirst({
    include: { milestones: { orderBy: { year: 'asc' } } },
  });
  return NextResponse.json(author);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { milestones, id, createdAt, updatedAt, ...data } = body;

  // Obtener el autor existente o crear uno nuevo
  const existing = await prisma.author.findFirst();

  let author;
  if (existing) {
    // Actualizar milestones: eliminar y recrear
    if (milestones) {
      await prisma.milestone.deleteMany({ where: { authorId: existing.id } });
    }

    author = await prisma.author.update({
      where: { id: existing.id },
      data: {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        milestones: milestones
          ? { create: milestones.map(({ id: _id, authorId: _aid, createdAt: _cat, ...m }: { id?: string; authorId?: string; createdAt?: string; year: number; labelEs: string; labelEn: string }) => m) }
          : undefined,
      },
      include: { milestones: { orderBy: { year: 'asc' } } },
    });
  } else {
    author = await prisma.author.create({
      data: {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        milestones: milestones ? { create: milestones } : undefined,
      },
      include: { milestones: { orderBy: { year: 'asc' } } },
    });
  }

  return NextResponse.json(author);
}
