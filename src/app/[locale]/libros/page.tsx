import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import BookGrid from '@/components/books/BookGrid';
import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === 'es' ? 'Libros' : 'Books' };
}

export default async function LibrosPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('books');

  const books = await prisma.book.findMany({
    where:   { isPublished: true },
    include: { prices: { where: { isActive: true } } },
    orderBy: { publishedAt: 'desc' },
  });

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto px-6 py-16">
      <h1 className="font-display text-4xl md:text-5xl font-bold text-ink mb-4">{t('title')}</h1>
      <p className="text-ink/60 font-body mb-12">
        {locale === 'es' ? `${books.length} obra${books.length !== 1 ? 's' : ''} disponible${books.length !== 1 ? 's' : ''}` : `${books.length} work${books.length !== 1 ? 's' : ''} available`}
      </p>

      {books.length === 0 ? (
        <p className="text-ink/50 font-body text-center py-20">{t('noBooks')}</p>
      ) : (
        <BookGrid books={books} locale={locale as 'es' | 'en'} />
      )}
    </div>
  );
}
