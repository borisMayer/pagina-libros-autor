export type CurrencyCode = 'ARS' | 'USD' | 'EUR' | 'MXN' | 'CLP' | 'COP';

const LOCALE_MAP: Record<CurrencyCode, string> = {
  ARS: 'es-AR',
  USD: 'en-US',
  EUR: 'de-DE',
  MXN: 'es-MX',
  CLP: 'es-CL',
  COP: 'es-CO',
};

export function formatPrice(amount: number | string, currency: CurrencyCode): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat(LOCALE_MAP[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'ARS' || currency === 'CLP' || currency === 'COP' ? 0 : 2,
  }).format(num);
}

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  ARS: '$',
  USD: 'US$',
  EUR: '€',
  MXN: 'MX$',
  CLP: 'CL$',
  COP: 'CO$',
};
