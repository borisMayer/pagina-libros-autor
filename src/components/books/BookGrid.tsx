import BookCard from './BookCard';
import type { BookWithPrices } from '@/types';

interface Props {
  books: BookWithPrices[];
  locale: 'es' | 'en';
}

export default function BookGrid({ books, locale }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {books.map((book) => (
        <BookCard key={book.id} book={book} locale={locale} />
      ))}
    </div>
  );
}
