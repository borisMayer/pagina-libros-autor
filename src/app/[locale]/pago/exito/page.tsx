'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface SaleInfo {
  status: string;
  downloadToken: string | null;
  book: { titleEs: string; titleEn: string; pdfUrl: string | null; epubUrl: string | null };
}

export default function PagoExitoPage() {
  const t = useTranslations('payment');
  const searchParams = useSearchParams();
  const saleId = searchParams.get('sale_id');

  const [sale, setSale] = useState<SaleInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(0);

  useEffect(() => {
    if (!saleId) { setLoading(false); return; }

    const fetchSale = async () => {
      const res = await fetch(`/api/sales/${saleId}/status`);
      if (res.ok) {
        const data = await res.json();
        setSale(data);
        if (data.status === 'APPROVED') setLoading(false);
        else if (data.status === 'PENDING' || data.status === 'PROCESSING') {
          // Poll again in 3s
          setTimeout(() => setPolling(p => p + 1), 3000);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchSale();
  }, [saleId, polling]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-body text-ink/70">{t('pending')}</p>
          <p className="font-body text-sm text-ink/50 mt-1">{t('pendingMessage')}</p>
        </div>
      </div>
    );
  }

  if (!sale || sale.status !== 'APPROVED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment px-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-6">⏳</div>
          <h1 className="font-display text-3xl font-bold text-ink mb-4">{t('pending')}</h1>
          <p className="font-body text-ink/70 mb-8">{t('pendingMessage')}</p>
          <Link href="/libros" className="text-brand-600 hover:underline font-body">
            Volver a libros
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-parchment px-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="font-display text-4xl font-bold text-ink mb-4">{t('success')}</h1>
        <p className="font-body text-ink/70 mb-2">{t('successMessage')}</p>
        <p className="font-body text-ink/70 mb-8">{t('downloadReady')}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {sale.book.pdfUrl && sale.downloadToken && (
            <a
              href={`/api/download/${sale.downloadToken}?format=pdf`}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-lg transition-all font-body"
            >
              {t('downloadPdf')}
            </a>
          )}
          {sale.book.epubUrl && sale.downloadToken && (
            <a
              href={`/api/download/${sale.downloadToken}?format=epub`}
              className="px-6 py-3 border-2 border-brand-600 text-brand-600 hover:bg-brand-50 font-semibold rounded-lg transition-all font-body"
            >
              {t('downloadEpub')}
            </a>
          )}
        </div>

        <p className="mt-6 text-xs text-ink/40 font-body">
          {t('tokenExpired').includes('30') ? 'El enlace expira en 30 minutos.' : 'Link expires in 30 minutes.'}
        </p>
      </div>
    </div>
  );
}
