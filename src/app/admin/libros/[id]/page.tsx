import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import BookForm from '@/components/admin/BookForm';
import type { Metadata } from 'next';

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: 'Editar libro — Admin' };

export default async function EditarLibroPage({ params }: Props) {
  const { id } = await params;
  const book = await prisma.book.findUnique({
    where: { id },
    include: { prices: true },
  });

  if (!book) notFound();

  return (
    <div className="animate-fadeIn max-w-3xl">
      <h1 className="font-display text-3xl font-bold text-ink mb-8">Editar libro</h1>
      <BookForm initialData={{
        ...book,
        publishedAt: book.publishedAt?.toISOString() ?? null,
        prices: book.prices.map(p => ({
          currency: p.currency,
          amount: Number(p.amount),
          isActive: p.isActive,
        })),
      }} />
    </div>
  );
}
