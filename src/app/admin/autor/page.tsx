import { prisma } from '@/lib/prisma';
import AuthorForm from '@/components/admin/AuthorForm';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Autor — Admin' };

export default async function AdminAutorPage() {
  const author = await prisma.author.findFirst({
    include: { milestones: { orderBy: { year: 'asc' } } },
  });

  return (
    <div className="animate-fadeIn max-w-3xl">
      <h1 className="font-display text-3xl font-bold text-ink mb-8">Editar autor</h1>
      <AuthorForm initialData={author} />
    </div>
  );
}
