import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

// GET /api/books — público (libros publicados) o admin (todos)
export async function GET(req: NextRequest) {
  const session = await auth();
  const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN';

  const books = await prisma.book.findMany({
    where: isAdmin ? {} : { isPublished: true },
    include: { prices: { where: { isActive: true } } },
    orderBy: { publishedAt: 'desc' },
  });

  return NextResponse.json(books);
}

const bookSchema = z.object({
  slug:          z.string().min(3),
  titleEs:       z.string().min(1),
  titleEn:       z.string().min(1),
  descriptionEs: z.string().min(1),
  descriptionEn: z.string().min(1),
  authorName:    z.string().min(1),
  coverUrl:      z.string().url(),
  pdfUrl:        z.string().url().optional(),
  epubUrl:       z.string().url().optional(),
  excerptPdfUrl: z.string().url().optional(),
  pageCount:     z.number().int().optional(),
  genre:         z.string().optional(),
  isbn:          z.string().optional(),
  isPublished:   z.boolean().default(false),
  publishedAt:   z.string().datetime().optional(),
  prices: z.array(z.object({
    currency: z.enum(['ARS', 'USD', 'EUR', 'MXN', 'CLP', 'COP']),
    amount:   z.number().positive(),
    isActive: z.boolean().default(true),
  })).optional(),
});

// POST /api/books — solo admin
export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = bookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { prices, publishedAt, ...data } = parsed.data;

  const book = await prisma.book.create({
    data: {
      ...data,
      publishedAt: publishedAt ? new Date(publishedAt) : null,
      prices: prices
        ? { create: prices }
        : undefined,
    },
    include: { prices: true },
  });

  return NextResponse.json(book, { status: 201 });
}
