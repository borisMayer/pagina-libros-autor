import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'es' ? 'Inicio' : 'Home',
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('home');

  const author = await prisma.author.findFirst();
  const booksCount = await prisma.book.count({ where: { isPublished: true } });

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-ink">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 80px)',
          }} />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <p className="text-brand-400 text-sm font-medium tracking-widest uppercase mb-6 font-body">
            {t('hero')}
          </p>
          <h1 className="font-display text-5xl md:text-7xl text-white font-bold leading-tight mb-6">
            {author?.nameEs ?? 'Andrew Myer'}
          </h1>
          <p className="text-gray-300 text-xl md:text-2xl font-body font-light mb-10 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/libros"
              className="px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-lg transition-all font-body inline-block"
            >
              {t('cta')} ({booksCount})
            </Link>
            <Link
              href="/biografia"
              className="px-8 py-4 border border-white/30 hover:border-white/60 text-white font-semibold rounded-lg transition-all font-body inline-block"
            >
              {t('ctaBio')}
            </Link>
          </div>
        </div>
      </section>

      {/* Quick bio strip */}
      {author && (
        <section className="bg-parchment py-20 px-6">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
            {author.photoUrl && (
              <div className="flex-shrink-0">
                <Image
                  src={author.photoUrl}
                  alt={locale === 'es' ? author.nameEs : author.nameEn}
                  width={200}
                  height={200}
                  className="rounded-full object-cover shadow-lg"
                />
              </div>
            )}
            <div>
              <p className="text-ink/80 text-lg leading-relaxed font-body">
                {locale === 'es'
                  ? author.bioEs.slice(0, 300) + '…'
                  : author.bioEn.slice(0, 300) + '…'}
              </p>
              <Link
                href="/biografia"
                className="mt-4 inline-block text-brand-700 font-semibold hover:underline"
              >
                {locale === 'es' ? 'Leer biografía completa →' : 'Read full biography →'}
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
