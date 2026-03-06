import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Libros — Admin' };

export default async function AdminLibrosPage() {
  const books = await prisma.book.findMany({
    include: { prices: true, _count: { select: { sales: { where: { status: 'APPROVED' } } } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-ink">Libros</h1>
        <Link
          href="/admin/libros/nuevo"
          className="px-5 py-2.5 bg-ink hover:bg-brand-900 text-white font-semibold rounded-xl transition-all font-body text-sm"
        >
          + Nuevo libro
        </Link>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-4">📚</p>
          <p className="font-body text-ink/50 mb-4">No hay libros cargados aún.</p>
          <Link href="/admin/libros/nuevo" className="text-brand-600 hover:underline font-body font-semibold">
            Crear el primer libro →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {books.map(book => (
            <div key={book.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
              <Image
                src={book.coverUrl}
                alt={book.titleEs}
                width={56}
                height={80}
                className="rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-bold text-ink truncate">{book.titleEs}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold font-body ${
                    book.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {book.isPublished ? 'Publicado' : 'Borrador'}
                  </span>
                </div>
                <p className="text-xs text-ink/50 font-body">
                  {book._count.sales} venta{book._count.sales !== 1 ? 's' : ''} · {book.prices.length} precio{book.prices.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Link
                href={`/admin/libros/${book.id}`}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-ink text-sm font-semibold rounded-lg transition-all font-body flex-shrink-0"
              >
                Editar
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
