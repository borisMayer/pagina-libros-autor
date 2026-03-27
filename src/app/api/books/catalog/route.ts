import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ALLOWED_ORIGINS = [
  'https://andrewmyer.com',
  'https://www.andrewmyer.com',
  'https://andrew-myer-3d.vercel.app',
  'http://localhost:5173',
  'http://localhost:3001',
];

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin':  allowed,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
  };
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get('origin')) });
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get('origin');
  const cors   = corsHeaders(origin);

  const books = await prisma.book.findMany({
    where:   { isPublished: true },
    include: { prices: { where: { isActive: true } } },
    orderBy: { publishedAt: 'desc' },
  });

  const catalog = books.map(b => ({
    id:          b.id,
    slug:        b.slug,
    titleEs:     b.titleEs,
    titleEn:     b.titleEn,
    isbn:        b.isbn,
    prices:      b.prices.map(p => ({
      currency: p.currency,
      amount:   Number(p.amount),
    })),
  }));

  return NextResponse.json({ books: catalog }, { headers: cors });
}
