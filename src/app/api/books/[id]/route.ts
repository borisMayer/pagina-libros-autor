import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const book = await prisma.book.findUnique({
    where: { id },
    include: { prices: true },
  });
  if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(book);
}

const updateSchema = z.object({
  titleEs:       z.string().min(1).optional(),
  titleEn:       z.string().min(1).optional(),
  descriptionEs: z.string().min(1).optional(),
  descriptionEn: z.string().min(1).optional(),
  authorName:    z.string().min(1).optional(),
  coverUrl:      z.string().url().optional(),
  pdfUrl:        z.string().url().nullable().optional(),
  epubUrl:       z.string().url().nullable().optional(),
  excerptPdfUrl: z.string().url().nullable().optional(),
  pageCount:     z.number().int().nullable().optional(),
  genre:         z.string().nullable().optional(),
  isbn:          z.string().nullable().optional(),
  isPublished:   z.boolean().optional(),
  publishedAt:   z.string().datetime().nullable().optional(),
  prices: z.array(z.object({
    currency: z.enum(['ARS', 'USD', 'EUR', 'MXN', 'CLP', 'COP']),
    amount:   z.number().positive(),
    isActive: z.boolean().default(true),
  })).optional(),
});

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { prices, publishedAt, ...data } = parsed.data;

  // Actualizar precios si se envían
  if (prices) {
    await prisma.price.deleteMany({ where: { bookId: id } });
  }

  const book = await prisma.book.update({
    where: { id },
    data: {
      ...data,
      publishedAt: publishedAt ? new Date(publishedAt) : undefined,
      prices: prices ? { create: prices } : undefined,
    },
    include: { prices: true },
  });

  return NextResponse.json(book);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await prisma.book.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
