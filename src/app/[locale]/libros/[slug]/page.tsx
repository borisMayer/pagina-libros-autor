import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import BuyButton from '@/components/payment/BuyButton';
import { formatPrice } from '@/lib/currency';
import type { CurrencyCode } from '@/lib/currency';
import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const book = await prisma.book.findUnique({ where: { slug } });
  if (!book) return { title: 'Not Found' };
  return {
    title: locale === 'es' ? book.titleEs : book.titleEn,
    description: locale === 'es' ? book.descriptionEs.slice(0, 160) : book.descriptionEn.slice(0, 160),
    openGraph: {
      images: [{ url: book.coverUrl, width: 400, height: 600 }],
    },
  };
}

export default async function BookDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations('books');
  const pt = await getTranslations('payment');

  const book = await prisma.book.findUnique({
    where:   { slug, isPublished: true },
    include: { prices: { where: { isActive: true } } },
  });

  if (!book) notFound();

  const title       = locale === 'es' ? book.titleEs       : book.titleEn;
  const description = locale === 'es' ? book.descriptionEs : book.descriptionEn;

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto px-6 py-16">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Cover */}
        <div className="flex-shrink-0">
          <Image
            src={book.coverUrl}
            alt={title}
            width={300}
            height={420}
            className="rounded-xl book-shadow object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1">
          <p className="text-brand-600 text-sm font-semibold tracking-widest uppercase mb-3 font-body">
            {book.genre ?? t('genre')}
          </p>
          <h1 className="font-display text-4xl font-bold text-ink mb-2">{title}</h1>
          <p className="text-ink/60 font-body mb-6">
            {t('by')} <span className="font-semibold">{book.authorName}</span>
            {book.publishedAt && (
              <span className="ml-3">· {new Date(book.publishedAt).getFullYear()}</span>
            )}
            {book.pageCount && (
              <span className="ml-3">· {book.pageCount} {t('pages')}</span>
            )}
          </p>

          <p className="text-ink/80 font-body text-lg leading-relaxed mb-8">{description}</p>

          {/* Prices */}
          {book.prices.length > 0 && (
            <div className="mb-8">
              <p className="text-sm text-ink/50 font-body mb-2">{t('price')}</p>
              <div className="flex flex-wrap gap-3">
                {book.prices.map((price) => (
                  <span key={price.id}
                    className="bg-brand-50 border border-brand-200 text-brand-900 px-3 py-1 rounded-full text-sm font-semibold font-body">
                    {formatPrice(Number(price.amount), price.currency as CurrencyCode)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Buy button */}
          <BuyButton book={{
            id: book.id,
            titleEs: book.titleEs,
            titleEn: book.titleEn,
            prices: book.prices.map(p => ({
              currency: p.currency,
              amount: Number(p.amount),
            })),
          }} locale={locale as 'es' | 'en'} />
        </div>
      </div>

      {/* Excerpt */}
      {book.excerptPdfUrl && (
        <div className="mt-16">
          <h2 className="font-display text-2xl font-bold text-ink mb-6">{t('excerpt')}</h2>
          <div className="rounded-xl overflow-hidden shadow-lg border border-ink/10">
            <iframe
              src={book.excerptPdfUrl}
              className="w-full"
              style={{ height: '70vh' }}
              title={`Extracto: ${title}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
