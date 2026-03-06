import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { formatPrice } from '@/lib/currency';
import type { CurrencyCode } from '@/lib/currency';
import type { BookWithPrices } from '@/types';

interface Props {
  book: BookWithPrices;
  locale: 'es' | 'en';
}

export default function BookCard({ book, locale }: Props) {
  const title = locale === 'es' ? book.titleEs : book.titleEn;
  const primaryPrice = book.prices.find(p => p.currency === 'ARS') ?? book.prices[0];

  return (
    <article className="group bg-white rounded-xl overflow-hidden book-shadow flex flex-col">
      <Link
        href={{ pathname: '/libros/[slug]', params: { slug: book.slug } }}
        className="relative block overflow-hidden"
      >
        <div className="aspect-[2/3] relative">
          <Image
            src={book.coverUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-brand-600 font-semibold tracking-widest uppercase mb-1 font-body">
          {book.genre ?? ''}
        </p>
        <Link href={{ pathname: '/libros/[slug]', params: { slug: book.slug } }}>
          <h3 className="font-display text-lg font-bold text-ink leading-tight mb-1 hover:text-brand-700 transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>
        <p className="text-xs text-ink/50 font-body mb-3">{book.authorName}</p>

        <div className="mt-auto flex items-center justify-between">
          {primaryPrice ? (
            <span className="font-body font-bold text-ink">
              {formatPrice(Number(primaryPrice.amount), primaryPrice.currency as CurrencyCode)}
            </span>
          ) : (
            <span className="font-body text-ink/40 text-sm">—</span>
          )}

          <Link
            href={{ pathname: '/libros/[slug]', params: { slug: book.slug } }}
            className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-lg transition-all font-body"
          >
            {locale === 'es' ? 'Ver detalles' : 'View details'}
          </Link>
        </div>
      </div>
    </article>
  );
}
