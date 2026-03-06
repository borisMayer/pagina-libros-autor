import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === 'es' ? 'Biografía' : 'Biography' };
}

export default async function BiografiaPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('biography');

  const author = await prisma.author.findFirst({
    include: { milestones: { orderBy: { year: 'asc' } } },
  });

  if (!author) notFound();

  const name = locale === 'es' ? author.nameEs : author.nameEn;
  const bio  = locale === 'es' ? author.bioEs  : author.bioEn;

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-10 items-start mb-16">
        {author.photoUrl && (
          <div className="flex-shrink-0">
            <Image
              src={author.photoUrl}
              alt={name}
              width={240}
              height={320}
              className="rounded-xl object-cover shadow-xl"
            />
          </div>
        )}
        <div className="flex-1">
          <p className="text-brand-600 text-sm font-semibold tracking-widest uppercase mb-3 font-body">
            {t('title')}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-ink mb-6">{name}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-ink/60 font-body mb-6">
            {author.nationality && <span>🌍 {author.nationality}</span>}
            {author.birthDate && (
              <span>
                🗓 {t('born')}: {new Date(author.birthDate).getFullYear()}
              </span>
            )}
            {author.website && (
              <a href={author.website} target="_blank" rel="noopener noreferrer"
                className="text-brand-600 hover:underline">
                🌐 Web
              </a>
            )}
            {author.twitter && (
              <a href={`https://twitter.com/${author.twitter}`} target="_blank" rel="noopener noreferrer"
                className="text-brand-600 hover:underline">
                𝕏 @{author.twitter}
              </a>
            )}
            {author.instagram && (
              <a href={`https://instagram.com/${author.instagram}`} target="_blank" rel="noopener noreferrer"
                className="text-brand-600 hover:underline">
                📸 @{author.instagram}
              </a>
            )}
          </div>
          <p className="text-ink/80 text-lg leading-relaxed font-body whitespace-pre-line">{bio}</p>
        </div>
      </div>

      {/* Timeline */}
      {author.milestones.length > 0 && (
        <div>
          <h2 className="font-display text-3xl font-bold text-ink mb-10">{t('timeline')}</h2>
          <div className="relative">
            <div className="absolute left-12 top-0 bottom-0 w-px bg-brand-200" />
            <div className="space-y-8">
              {author.milestones.map((milestone) => (
                <div key={milestone.id} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-24 text-right">
                    <span className="inline-block bg-brand-900 text-white text-xs font-bold px-2 py-1 rounded font-body">
                      {milestone.year}
                    </span>
                  </div>
                  <div className="flex-shrink-0 w-4 h-4 rounded-full bg-brand-600 mt-1 ring-4 ring-parchment" />
                  <p className="text-ink font-body text-base leading-relaxed pt-0.5">
                    {locale === 'es' ? milestone.labelEs : milestone.labelEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
