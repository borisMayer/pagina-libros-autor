// src/lib/email/send.ts
import { resend, FROM_EMAIL } from './resend';
import { purchaseConfirmationEmail } from './templates/purchase-confirmation';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface SendPurchaseEmailParams {
  to:            string;
  buyerName:     string | null;
  bookTitleEs:   string;
  bookTitleEn:   string;
  bookCoverUrl:  string;
  authorName:    string;
  downloadToken: string;
  hasPdf:        boolean;
  hasEpub:       boolean;
  currency:      string;
  amount:        string;
  locale?:       'es' | 'en';
}

// ─── Envío de confirmación de compra ─────────────────────────────────────────

export async function sendPurchaseConfirmationEmail(
  params: SendPurchaseEmailParams
): Promise<{ success: boolean; id?: string; error?: string }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pagina-libros-autor.vercel.app';
  const locale = params.locale ?? 'es';

  const { subject, html, text } = purchaseConfirmationEmail({
    ...params,
    locale,
    appUrl,
  });

  try {
    const result = await resend.emails.send({
      from:    FROM_EMAIL,
      to:      params.to,
      subject,
      html,
      text,
      tags: [
        { name: 'category',  value: 'purchase_confirmation' },
        { name: 'book',      value: params.bookTitleEs.slice(0, 50).replace(/[^a-zA-Z0-9_-]/g, '_') },
      ],
    });

    if (result.error) {
      console.error('[Email] Error de Resend:', result.error);
      return { success: false, error: result.error.message };
    }

    console.log(`[Email] ✅ Confirmación enviada a ${params.to}, id: ${result.data?.id}`);
    return { success: true, id: result.data?.id };

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Email] Error inesperado:', message);
    return { success: false, error: message };
  }
}
