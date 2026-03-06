import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { verifyDownloadToken } from '@/lib/download-token';
import { Link } from '@/i18n/navigation';

type Props = { params: Promise<{ locale: string; token: string }> };

export default async function DescargaPage({ params }: Props) {
  const { locale, token } = await params;
  const t = await getTranslations('payment');

  const { valid, saleId } = verifyDownloadToken(token);

  if (!valid || !saleId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment px-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">⏰</div>
          <h1 className="font-display text-3xl font-bold text-ink mb-4">Enlace inválido</h1>
          <p className="font-body text-ink/70 mb-6">{t('tokenExpired')}</p>
          <Link href="/libros" className="text-brand-600 hover:underline font-body">
            Volver a los libros
          </Link>
        </div>
      </div>
    );
  }

  const sale = await prisma.sale.findUnique({
    where:   { id: saleId },
    include: {
      book: {
        select: { titleEs: true, titleEn: true, pdfUrl: true, epubUrl: true }
      }
    },
  });

  if (!sale || sale.status !== 'APPROVED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment px-6">
        <div className="text-center">
          <p className="font-body text-ink/70">Acceso denegado.</p>
        </div>
      </div>
    );
  }

  const title = locale === 'es' ? sale.book.titleEs : sale.book.titleEn;
  const isExpired = sale.downloadExpiresAt && sale.downloadExpiresAt < new Date();
  const limitReached = sale.downloadCount >= sale.maxDownloads;

  return (
    <div className="min-h-screen flex items-center justify-center bg-parchment px-6">
      <div className="text-center max-w-md">
        {isExpired || limitReached ? (
          <>
            <div className="text-5xl mb-4">⏰</div>
            <h1 className="font-display text-3xl font-bold text-ink mb-4">Enlace expirado</h1>
            <p className="font-body text-ink/70">{t('tokenExpired')}</p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-6">📖</div>
            <h1 className="font-display text-3xl font-bold text-ink mb-2">{title}</h1>
            <p className="font-body text-ink/70 mb-8">{t('downloadReady')}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {sale.book.pdfUrl && (
                <a href={`/api/download/${token}?format=pdf`}
                  className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-lg font-body transition-all">
                  {t('downloadPdf')}
                </a>
              )}
              {sale.book.epubUrl && (
                <a href={`/api/download/${token}?format=epub`}
                  className="px-6 py-3 border-2 border-brand-600 text-brand-600 hover:bg-brand-50 font-semibold rounded-lg font-body transition-all">
                  {t('downloadEpub')}
                </a>
              )}
            </div>
            <p className="mt-6 text-xs text-ink/40 font-body">
              Descargas: {sale.downloadCount}/{sale.maxDownloads}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
