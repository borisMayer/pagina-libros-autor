import { prisma } from '@/lib/prisma';
import AuthorForm from '@/components/admin/AuthorForm';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Autor — Admin' };

export default async function AdminAutorPage() {
  const author = await prisma.author.findFirst({
    include: { milestones: { orderBy: { year: 'asc' } } },
  });

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1a1a2e', maxWidth: '720px' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 700, marginBottom: '28px' }}>
        Editar autor
      </h1>
      <AuthorForm initialData={author} />
    </div>
  );
}
