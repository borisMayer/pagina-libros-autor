import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mpClient, verifyMercadoPagoSignature } from '@/lib/mercadopago';
import { generateDownloadToken } from '@/lib/download-token';
import { Payment } from 'mercadopago';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // 1. Verificar firma del webhook
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

  // 2. Solo procesar eventos de pago
  if (payload.type !== 'payment') {
    return NextResponse.json({ received: true });
  }

  const paymentId = payload.data?.id;
  if (!paymentId) {
    return NextResponse.json({ error: 'Missing payment ID' }, { status: 400 });
  }

  try {
    // 3. Consultar el pago en la API de MP
    const paymentClient = new Payment(mpClient);
    const payment = await paymentClient.get({ id: paymentId });

    const saleId = payment.external_reference;
    if (!saleId) {
      console.warn('[Webhook MP] Sin external_reference, paymentId:', paymentId);
      return NextResponse.json({ received: true });
    }

    // 4. Procesar según estado
    switch (payment.status) {
      case 'approved': {
        const { token, expiresAt } = generateDownloadToken(saleId);
        await prisma.sale.update({
          where: { id: saleId },
          data:  {
            status:           'APPROVED',
            mpPaymentId:      String(paymentId),
            mpPayerEmail:     payment.payer?.email ?? null,
            downloadToken:    token,
            downloadExpiresAt: expiresAt,
          },
        });
        console.log(`[Webhook MP] ✅ Venta aprobada: ${saleId}`);
        break;
      }

      case 'rejected':
        await prisma.sale.update({
          where: { id: saleId },
          data:  { status: 'REJECTED', mpPaymentId: String(paymentId) },
        });
        console.log(`[Webhook MP] ❌ Venta rechazada: ${saleId}`);
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
        console.log(`[Webhook MP] Estado no manejado: ${payment.status} para venta ${saleId}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('[Webhook MP] Error:', error);
    // Retornar 200 para que MP no reintente indefinidamente
    return NextResponse.json({ received: true });
  }
}
