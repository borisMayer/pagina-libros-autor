'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CURRENCIES = ['ARS', 'USD', 'EUR', 'MXN', 'CLP', 'COP'];

interface PriceInput { currency: string; amount: number; isActive: boolean; }
interface BookFormData {
  id?: string; slug?: string; titleEs?: string; titleEn?: string;
  descriptionEs?: string; descriptionEn?: string; authorName?: string;
  coverUrl?: string; pdfUrl?: string | null; epubUrl?: string | null;
  excerptPdfUrl?: string | null; pageCount?: number | null; genre?: string | null;
  isbn?: string | null; isPublished?: boolean; publishedAt?: string | null;
  prices?: PriceInput[];
}

export default function BookForm({ initialData }: { initialData?: BookFormData }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const isEdit = !!initialData?.id;

  const [form, setForm] = useState({
    slug:          initialData?.slug          ?? '',
    titleEs:       initialData?.titleEs       ?? '',
    titleEn:       initialData?.titleEn       ?? '',
    descriptionEs: initialData?.descriptionEs ?? '',
    descriptionEn: initialData?.descriptionEn ?? '',
    authorName:    initialData?.authorName    ?? 'Andrew Myer',
    coverUrl:      initialData?.coverUrl      ?? '',
    pdfUrl:        initialData?.pdfUrl        ?? '',
    epubUrl:       initialData?.epubUrl       ?? '',
    excerptPdfUrl: initialData?.excerptPdfUrl ?? '',
    pageCount:     initialData?.pageCount?.toString() ?? '',
    genre:         initialData?.genre         ?? '',
    isbn:          initialData?.isbn          ?? '',
    isPublished:   initialData?.isPublished   ?? false,
    publishedAt:   initialData?.publishedAt   ? initialData.publishedAt.slice(0, 10) : '',
  });

  const [prices, setPrices] = useState<PriceInput[]>(
    initialData?.prices ?? [{ currency: 'ARS', amount: 0, isActive: true }]
  );

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const addPrice = () =>
    setPrices(p => [...p, { currency: 'USD', amount: 0, isActive: true }]);

  const removePrice = (i: number) =>
    setPrices(p => p.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true); setMsg('');
    const url = isEdit ? `/api/books/${initialData!.id}` : '/api/books';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        pageCount: form.pageCount ? parseInt(form.pageCount) : null,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
        prices,
      }),
    });

    setSaving(false);
    if (res.ok) {
      setMsg('✅ Guardado correctamente');
      if (!isEdit) router.push('/admin/libros');
      else router.refresh();
    } else {
      const err = await res.json();
      setMsg('❌ Error: ' + JSON.stringify(err.error));
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este libro? Esta acción no se puede deshacer.')) return;
    await fetch(`/api/books/${initialData!.id}`, { method: 'DELETE' });
    router.push('/admin/libros');
  };

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:outline-none font-body text-ink';
  const labelCls = 'block text-xs font-semibold text-ink/60 uppercase tracking-wide mb-2 font-body';

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
      {/* Basic info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelCls}>Slug (URL) *</label><input className={inputCls} value={form.slug} onChange={set('slug')} placeholder="mi-libro-ejemplo" /></div>
        <div><label className={labelCls}>Nombre del autor *</label><input className={inputCls} value={form.authorName} onChange={set('authorName')} /></div>
        <div><label className={labelCls}>Título (ES) *</label><input className={inputCls} value={form.titleEs} onChange={set('titleEs')} /></div>
        <div><label className={labelCls}>Título (EN) *</label><input className={inputCls} value={form.titleEn} onChange={set('titleEn')} /></div>
      </div>

      <div><label className={labelCls}>Descripción (ES) *</label><textarea className={inputCls} rows={4} value={form.descriptionEs} onChange={set('descriptionEs')} /></div>
      <div><label className={labelCls}>Descripción (EN) *</label><textarea className={inputCls} rows={4} value={form.descriptionEn} onChange={set('descriptionEn')} /></div>

      {/* Files */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelCls}>URL Portada * </label><input className={inputCls} value={form.coverUrl} onChange={set('coverUrl')} placeholder="https://..." /></div>
        <div><label className={labelCls}>URL PDF (privado)</label><input className={inputCls} value={form.pdfUrl} onChange={set('pdfUrl')} /></div>
        <div><label className={labelCls}>URL EPUB (privado)</label><input className={inputCls} value={form.epubUrl} onChange={set('epubUrl')} /></div>
        <div><label className={labelCls}>URL Extracto (público)</label><input className={inputCls} value={form.excerptPdfUrl} onChange={set('excerptPdfUrl')} /></div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div><label className={labelCls}>Género</label><input className={inputCls} value={form.genre} onChange={set('genre')} /></div>
        <div><label className={labelCls}>Páginas</label><input type="number" className={inputCls} value={form.pageCount} onChange={set('pageCount')} /></div>
        <div><label className={labelCls}>ISBN</label><input className={inputCls} value={form.isbn} onChange={set('isbn')} /></div>
        <div><label className={labelCls}>Fecha publicación</label><input type="date" className={inputCls} value={form.publishedAt} onChange={set('publishedAt')} /></div>
      </div>

      {/* Published toggle */}
      <div className="flex items-center gap-3">
        <input type="checkbox" id="isPublished" checked={form.isPublished}
          onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
          className="w-5 h-5 rounded accent-brand-600" />
        <label htmlFor="isPublished" className="font-body font-semibold text-ink cursor-pointer">
          Publicado (visible para todos)
        </label>
      </div>

      {/* Prices */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className={labelCls + ' mb-0'}>Precios por moneda</label>
          <button onClick={addPrice} className="text-xs text-brand-600 font-semibold hover:underline font-body">+ Agregar</button>
        </div>
        <div className="space-y-3">
          {prices.map((price, i) => (
            <div key={i} className="flex gap-2 items-center">
              <select
                className="w-28 px-3 py-2 rounded-xl border border-gray-200 font-body text-sm"
                value={price.currency}
                onChange={e => setPrices(p => p.map((pr, idx) => idx === i ? { ...pr, currency: e.target.value } : pr))}
              >
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input
                type="number" step="0.01" min="0"
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 font-body text-sm"
                placeholder="0.00" value={price.amount}
                onChange={e => setPrices(p => p.map((pr, idx) => idx === i ? { ...pr, amount: parseFloat(e.target.value) || 0 } : pr))}
              />
              <button onClick={() => removePrice(i)} className="text-red-400 hover:text-red-600 px-2 py-2">✕</button>
            </div>
          ))}
        </div>
      </div>

      {msg && <p className="font-body text-sm">{msg}</p>}

      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-3 bg-ink hover:bg-brand-900 text-white font-bold rounded-xl transition-all font-body disabled:opacity-60">
          {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear libro'}
        </button>
        {isEdit && (
          <button onClick={handleDelete}
            className="px-6 py-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl transition-all font-body">
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
}
