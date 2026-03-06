import crypto from 'crypto';

const SECRET = process.env.DOWNLOAD_TOKEN_SECRET ?? 'dev-secret-change-in-production';
const EXPIRY_MS = 30 * 60 * 1000; // 30 minutos

export function generateDownloadToken(saleId: string): {
  token: string;
  expiresAt: Date;
} {
  const expiresAt = new Date(Date.now() + EXPIRY_MS);
  const payload = `${saleId}:${expiresAt.getTime()}`;
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(payload)
    .digest('hex');

  const token = Buffer.from(`${payload}:${signature}`).toString('base64url');
  return { token, expiresAt };
}

export function verifyDownloadToken(token: string): {
  valid: boolean;
  saleId?: string;
} {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length !== 3) return { valid: false };

    const [saleId, expiresAtStr, signature] = parts;

    if (Date.now() > parseInt(expiresAtStr)) {
      return { valid: false }; // Expirado
    }

    const payload = `${saleId}:${expiresAtStr}`;
    const expectedSignature = crypto
      .createHmac('sha256', SECRET)
      .update(payload)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );

    return { valid: isValid, saleId: isValid ? saleId : undefined };
  } catch {
    return { valid: false };
  }
}
