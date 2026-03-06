import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

type Props = { params: Promise<{ locale: string }> };

export default async function PagoErrorPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('payment');

  return (
    <div className="min-h-screen flex items-center justify-center bg-parchment px-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">❌</div>
        <h1 className="font-display text-4xl font-bold text-ink mb-4">{t('error')}</h1>
        <p className="font-body text-ink/70 mb-8">{t('errorMessage')}</p>
        <Link
          href="/libros"
          className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-lg transition-all font-body inline-block"
        >
          {t('retry')}
        </Link>
      </div>
    </div>
  );
}
