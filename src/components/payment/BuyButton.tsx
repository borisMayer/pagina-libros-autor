'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface Price {
  currency: string;
  amount: number;
}

interface Props {
  book: { id: string; titleEs: string; titleEn: string; prices: Price[] };
  locale: 'es' | 'en';
}

const CURRENCY_LABELS: Record<string, string> = {
  ARS: '🇦🇷 ARS',
  USD: '🇺🇸 USD',
  EUR: '🇪🇺 EUR',
  MXN: '🇲🇽 MXN',
  CLP: '🇨🇱 CLP',
  COP: '🇨🇴 COP',
};

export default function BuyButton({ book, locale }: Props) {
  const t = useTranslations('payment');
  const tb = useTranslations('books');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState(book.prices[0]?.currency ?? 'ARS');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  if (book.prices.length === 0) {
    return (
      <p className="text-ink/50 font-body text-sm">{tb('outOfStock')}</p>
    );
  }

  const selectedPrice = book.prices.find(p => p.currency === currency) ?? book.prices[0];

  const handleBuy = async () => {
    if (!email) {
      setError(locale === 'es' ? 'Ingresa tu email' : 'Enter your email');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: book.id,
          currency,
          buyerEmail: email,
          buyerName: name,
          locale,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Error al crear el pago');
        setLoading(false);
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch {
      setError(
        locale === 'es'
          ? 'Error de conexión. Intenta de nuevo.'
          : 'Connection error. Please try again.'
      );
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full sm:w-auto px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold text-lg rounded-xl transition-all shadow-md hover:shadow-lg font-body"
      >
        {locale === 'es' ? '🛒 Comprar ahora' : '🛒 Buy now'}
      </button>
    );
  }

  return (
    <div className="bg-brand-50 border border-brand-200 rounded-xl p-6 space-y-4">
      <h3 className="font-display text-lg font-bold text-ink">{t('title')}</h3>

      {/* Currency selector */}
      {book.prices.length > 1 && (
        <div>
          <label className="block text-xs font-semibold text-ink/60 uppercase tracking-wide mb-2 font-body">
            {t('currency')}
          </label>
          <div className="flex flex-wrap gap-2">
            {book.prices.map(p => (
              <button
                key={p.currency}
                onClick={() => setCurrency(p.currency)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold font-body transition-all ${
                  currency === p.currency
                    ? 'bg-brand-600 text-white'
                    : 'bg-white border border-brand-200 text-ink hover:border-brand-400'
                }`}
              >
                {CURRENCY_LABELS[p.currency] ?? p.currency}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Email */}
      <div>
        <label className="block text-xs font-semibold text-ink/60 uppercase tracking-wide mb-2 font-body">
          {t('email')} *
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="correo@ejemplo.com"
          className="w-full px-4 py-2.5 rounded-lg border border-brand-200 focus:border-brand-500 focus:outline-none font-body text-ink"
        />
      </div>

      {/* Name */}
      <div>
        <label className="block text-xs font-semibold text-ink/60 uppercase tracking-wide mb-2 font-body">
          {t('name')}
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={locale === 'es' ? 'Tu nombre' : 'Your name'}
          className="w-full px-4 py-2.5 rounded-lg border border-brand-200 focus:border-brand-500 focus:outline-none font-body text-ink"
        />
      </div>

      {error && <p className="text-red-600 text-sm font-body">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={handleBuy}
          disabled={loading}
          className="flex-1 py-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white font-bold rounded-xl transition-all font-body flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t('processing')}
            </>
          ) : (
            <>
              {t('buyWith')}
              {selectedPrice
                ? ` · ${new Intl.NumberFormat('es-AR', {
                    style: 'currency',
                    currency: selectedPrice.currency,
                  }).format(selectedPrice.amount)}`
                : ''}
            </>
          )}
        </button>
        <button
          onClick={() => setShowForm(false)}
          className="px-4 py-3 border border-brand-200 rounded-xl text-ink/60 hover:text-ink font-body text-sm"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
