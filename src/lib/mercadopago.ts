import MercadoPagoConfig from 'mercadopago';
import crypto from 'crypto';

export const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN ?? '',
  options: { timeout: 5000 },
});

/**
 * Verifica la firma HMAC-SHA256 del webhook de Mercado Pago.
 * Docs: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 */
export function verifyMercadoPagoSignature(
  req: Request,
  rawBody: string
): boolean {
  try {
    const xSignature = req.headers.get('x-signature');
    const xRequestId = req.headers.get('x-request-id');

    if (!xSignature || !xRequestId) return false;

    const parts = Object.fromEntries(
      xSignature.split(',').map((part) => {
        const [k, v] = part.trim().split('=');
        return [k, v];
      })
    );

    const ts = parts['ts'];
    const v1 = parts['v1'];
    if (!ts || !v1) return false;

    const url = new URL(req.url);
    const dataId = url.searchParams.get('data.id') ?? '';

    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

    const hmac = crypto
      .createHmac('sha256', process.env.MP_WEBHOOK_SECRET ?? '')
      .update(manifest)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(hmac, 'hex'),
      Buffer.from(v1, 'hex')
    );
  } catch {
    return false;
  }
}
