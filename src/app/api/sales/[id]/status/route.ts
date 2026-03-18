import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const sale = await prisma.sale.findUnique({
    where: { id },
    select: {
      status:            true,
      downloadToken:     true, // token largo del email (7 días)
      mpOrderId:         true, // token corto directo (30 min)
      downloadExpiresAt: true,
      book: {
        select: {
          titleEs: true,
          titleEn: true,
          pdfUrl:  true,
          epubUrl: true,
        },
      },
    },
  });

  if (!sale) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    status:        sale.status,
    // La página de éxito usa el token directo (30 min) si existe,
    // si no, usa el del email (que aún puede estar vigente)
    downloadToken: sale.mpOrderId ?? sale.downloadToken,
    book:          sale.book,
  });
}
