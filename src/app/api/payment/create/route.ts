import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mpClient } from '@/lib/mercadopago';
import { Preference } from 'mercadopago';
import { z } from 'zod';

const schema = z.object({
  bookId:     z.string().cuid(),
  currency:   z.enum(['ARS', 'USD', 'EUR', 'MXN', 'CLP', 'COP']),
  buyerEmail: z.string().email(),
  buyerName:  z.string().optional(),
  locale:     z.enum(['es', 'en']).default('es'),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });
  }

  const { bookId, currency, buyerEmail, buyerName, locale } = parsed.data;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  // Buscar libro y precio
  const book = await prisma.book.findUnique({
    where: { id: bookId, isPublished: true },
    include: { prices: { where: { currency, isActive: true } } },
  });

  if (!book || book.prices.length === 0) {
    return NextResponse.json({ error: 'Libro o precio no disponible' }, { status: 404 });
  }

  const price = book.prices[0];

  // Crear venta en estado PENDING
  const sale = await prisma.sale.create({
    data: {
      bookId,
      buyerEmail,
      buyerName,
      amount: price.amount,
      currency,
      status: 'PENDING',
    },
  });

  // Crear preferencia en Mercado Pago
  const preferenceClient = new Preference(mpClient);
  const preference = await preferenceClient.create({
    body: {
      items: [
        {
          id:         book.id,
          title:      locale === 'es' ? book.titleEs : book.titleEn,
          quantity:   1,
          unit_price: Number(price.amount),
          currency_id: currency,
        },
      ],
      payer: {
        email: buyerEmail,
        name:  buyerName,
      },
      back_urls: {
        success: `${appUrl}/${locale}/pago/exito?sale_id=${sale.id}`,
        failure: `${appUrl}/${locale}/pago/error?sale_id=${sale.id}`,
        pending: `${appUrl}/${locale}/pago/exito?sale_id=${sale.id}`,
      },
      auto_return:           'approved',
      notification_url:     `${appUrl}/api/webhook/mercadopago`,
      external_reference:   sale.id,
      statement_descriptor: 'LIBROS',
    },
  });

  // Guardar preferenceId
  await prisma.sale.update({
    where:  { id: sale.id },
    data:   { mpPreferenceId: preference.id },
  });

  return NextResponse.json({
    checkoutUrl: preference.init_point,
    saleId:      sale.id,
  });
}
