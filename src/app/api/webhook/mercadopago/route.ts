import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mpClient, verifyMercadoPagoSignature } from '@/lib/mercadopago';
import { generateDownloadToken } from '@/lib/download-token';
import { sendPurchaseConfirmationEmail } from '@/lib/email/send';
import { Payment } from 'mercadopago';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const isValid = verifyMercadoPagoSignature(req, rawBody);
  if (!isValid && process.env.NODE_ENV === 'production') {
    console.error('[Webhook MP] Firma inválida');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: { type: string; data?: { id: string } };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (payload.type !== 'payment') {
    return NextResponse.json({ received: true });
  }

  const paymentId = payload.data?.id;
  if (!paymentId) {
    return NextResponse.json({ error: 'Missing payment ID' }, { status: 400 });
  }

  try {
    const paymentClient = new Payment(mpClient);
    const payment       = await paymentClient.get({ id: paymentId });
    const saleId        = payment.external_reference;

    if (!saleId) {
      console.warn('[Webhook MP] Sin external_reference, paymentId:', paymentId);
      return NextResponse.json({ received: true });
    }

    switch (payment.status) {
      case 'approved': {
        // Token largo (7 días) para el email
        const { token: emailToken,  expiresAt: emailExpiry  } = generateDownloadToken(saleId, 'email');
        // Token corto (30 min) para la página de éxito inmediata
        const { token: directToken } = generateDownloadToken(saleId, 'direct');

        const updatedSale = await prisma.sale.update({
          where: { id: saleId },
          data: {
            status:            'APPROVED',
            mpPaymentId:       String(paymentId),
            mpPayerEmail:      payment.payer?.email ?? null,
            downloadToken:     emailToken,
            downloadExpiresAt: emailExpiry,
            mpOrderId:         directToken, // token directo en campo auxiliar
          },
          include: {
            book: {
              select: {
                titleEs: true, titleEn: true,
                coverUrl: true, authorName: true,
                pdfUrl: true, epubUrl: true,
              },
            },
          },
        });

        console.log('[Webhook MP] ✅ Venta aprobada:', saleId);

        const locale: 'es' | 'en' =
          (payment.metadata as Record<string, string> | null)?.locale === 'en' ? 'en' : 'es';

        // Envío del email — no bloquea la respuesta al webhook
        sendPurchaseConfirmationEmail({
          to:            updatedSale.buyerEmail,
          buyerName:     updatedSale.buyerName,
          bookTitleEs:   updatedSale.book.titleEs,
          bookTitleEn:   updatedSale.book.titleEn,
          bookCoverUrl:  updatedSale.book.coverUrl,
          authorName:    updatedSale.book.authorName,
          downloadToken: emailToken,
          hasPdf:        !!updatedSale.book.pdfUrl,
          hasEpub:       !!updatedSale.book.epubUrl,
          currency:      updatedSale.currency,
          amount:        updatedSale.amount.toString(),
          locale,
        }).catch(err => console.error('[Email] Error:', err));

        break;
      }

      case 'rejected':
        await prisma.sale.update({
          where: { id: saleId },
          data:  { status: 'REJECTED', mpPaymentId: String(paymentId) },
        });
        console.log('[Webhook MP] ❌ Venta rechazada:', saleId);
        break;

      case 'in_process':
      case 'pending':
        await prisma.sale.update({
          where: { id: saleId },
          data:  { status: 'PROCESSING' },
        });
        break;

      case 'refunded':
        await prisma.sale.update({
          where: { id: saleId },
          data:  { status: 'REFUNDED' },
        });
        break;

      default:
        console.log('[Webhook MP] Estado no manejado:', payment.status);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('[Webhook MP] Error:', error);
    return NextResponse.json({ received: true });
  }
}
