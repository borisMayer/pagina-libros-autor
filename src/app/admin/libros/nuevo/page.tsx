import BookForm from '@/components/admin/BookForm';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Nuevo libro — Admin' };

export default function NuevoLibroPage() {
  return (
    <div className="animate-fadeIn max-w-3xl">
      <h1 className="font-display text-3xl font-bold text-ink mb-8">Nuevo libro</h1>
      <BookForm />
    </div>
  );
}
