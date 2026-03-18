import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sendPurchaseConfirmationEmail } from '@/lib/email/send';

// Solo disponible en desarrollo o para admins autenticados
export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { email, locale = 'es' } = await req.json();

  const result = await sendPurchaseConfirmationEmail({
    to:            email,
    buyerName:     'Lector de Prueba',
    bookTitleEs:   'El tiempo entre nosotros',
    bookTitleEn:   'The Time Between Us',
    bookCoverUrl:  'https://placehold.co/400x600/1a1a2e/ffffff?text=El+Tiempo+Entre+Nosotros',
    authorName:    'Andrew Myer',
    downloadToken: 'test-token-no-funciona',
    hasPdf:        true,
    hasEpub:       true,
    currency:      'ARS',
    amount:        '2500',
    locale:        locale as 'es' | 'en',
  });

  return NextResponse.json(result);
}
