import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Libros — Admin' };

export default async function AdminLibrosPage() {
  const books = await prisma.book.findMany({
    include: {
      prices:  true,
      _count:  { select: { sales: { where: { status: 'APPROVED' } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1a1a2e' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 700, margin: 0 }}>Libros</h1>
        <Link href="/admin/libros/nuevo" style={{
          padding: '10px 20px', background: '#1a1a2e', color: '#fff',
          borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: 600,
        }}>
          + Nuevo libro
        </Link>
      </div>

      {books.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', border: '1px solid #f0ede6' }}>
          <p style={{ fontSize: '40px', marginBottom: '12px' }}>📚</p>
          <p style={{ color: '#9ca3af', marginBottom: '16px' }}>No hay libros cargados aún.</p>
          <Link href="/admin/libros/nuevo" style={{ color: '#4a52ea', fontWeight: 600 }}>
            Crear el primer libro →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {books.map(book => (
            <div key={book.id} style={{
              background: '#fff', borderRadius: '14px', padding: '16px',
              border: '1px solid #f0ede6', display: 'flex', alignItems: 'center', gap: '16px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              <Image
                src={book.coverUrl} alt={book.titleEs}
                width={56} height={80}
                style={{ borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '15px' }}>{book.titleEs}</span>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: 600,
                    background: book.isPublished ? '#dcfce7' : '#fef9c3',
                    color:      book.isPublished ? '#15803d' : '#854d0e',
                  }}>
                    {book.isPublished ? 'Publicado' : 'Borrador'}
                  </span>
                </div>
                <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
                  {book._count.sales} venta{book._count.sales !== 1 ? 's' : ''} · {book.prices.length} precio{book.prices.length !== 1 ? 's' : ''}
                  {book.genre ? ` · ${book.genre}` : ''}
                </p>
              </div>
              <Link href={`/admin/libros/${book.id}`} style={{
                padding: '8px 18px', background: '#f3f4f6', color: '#1a1a2e',
                borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 600,
                flexShrink: 0,
              }}>
                Editar
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
