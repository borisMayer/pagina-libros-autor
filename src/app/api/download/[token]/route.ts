import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyDownloadToken } from '@/lib/download-token';

type Params = { params: Promise<{ token: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { token } = await params;
  const format = req.nextUrl.searchParams.get('format') ?? 'pdf';
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';

  // 1. Verificar token HMAC
  const { valid, saleId } = verifyDownloadToken(token);
  if (!valid || !saleId) {
    return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 403 });
  }

  // 2. Buscar venta
  const sale = await prisma.sale.findUnique({
    where:   { id: saleId },
    include: { book: true },
  });

  if (!sale) {
    return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 });
  }

  // 3. Verificar estado aprobado
  if (sale.status !== 'APPROVED') {
    return NextResponse.json({ error: 'Pago no confirmado' }, { status: 403 });
  }

  // 4. Verificar expiración del token
  if (sale.downloadExpiresAt && sale.downloadExpiresAt < new Date()) {
    return NextResponse.json({ error: 'Enlace de descarga expirado' }, { status: 403 });
  }

  // 5. Verificar límite de descargas
  if (sale.downloadCount >= sale.maxDownloads) {
    return NextResponse.json({ error: 'Límite de descargas alcanzado' }, { status: 403 });
  }

  // 6. Determinar URL del archivo
  const fileUrl = format === 'epub' ? sale.book.epubUrl : sale.book.pdfUrl;
  if (!fileUrl) {
    return NextResponse.json({ error: 'Formato no disponible' }, { status: 404 });
  }

  // 7. Registrar descarga en paralelo
  await Promise.all([
    prisma.sale.update({
      where: { id: saleId },
      data:  { downloadCount: { increment: 1 } },
    }),
    prisma.downloadLog.create({
      data: {
        saleId,
        format,
        ip,
        userAgent: req.headers.get('user-agent') ?? '',
      },
    }),
  ]);

  // 8. Redirigir al archivo (Vercel Blob URL)
  return NextResponse.redirect(fileUrl, { status: 302 });
}
