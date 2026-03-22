'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CURRENCIES = ['ARS', 'USD', 'EUR', 'MXN', 'CLP', 'COP'];
const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'system-ui' };
const lbl: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' };
const card: React.CSSProperties = { background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #f0ede6', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: '20px' };

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

  const handleSave = async () => {
    setSaving(true); setMsg('');
    const url    = isEdit ? `/api/books/${initialData!.id}` : '/api/books';
    const method = isEdit ? 'PUT' : 'POST';
    const res    = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        pageCount:   form.pageCount ? parseInt(form.pageCount) : null,
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

  return (
    <div>
      <div style={card}>
        <h2 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 600 }}>Información básica</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div><label style={lbl}>Slug (URL) *</label><input style={inp} value={form.slug} onChange={set('slug')} placeholder="mi-libro-ejemplo" /></div>
          <div><label style={lbl}>Nombre del autor</label><input style={inp} value={form.authorName} onChange={set('authorName')} /></div>
          <div><label style={lbl}>Título (ES) *</label><input style={inp} value={form.titleEs} onChange={set('titleEs')} /></div>
          <div><label style={lbl}>Título (EN) *</label><input style={inp} value={form.titleEn} onChange={set('titleEn')} /></div>
        </div>
        <div style={{ marginTop: '16px' }}>
          <label style={lbl}>Descripción (ES) *</label>
          <textarea style={{ ...inp, minHeight: '100px', resize: 'vertical' }} value={form.descriptionEs} onChange={set('descriptionEs')} />
        </div>
        <div style={{ marginTop: '16px' }}>
          <label style={lbl}>Descripción (EN) *</label>
          <textarea style={{ ...inp, minHeight: '100px', resize: 'vertical' }} value={form.descriptionEn} onChange={set('descriptionEn')} />
        </div>
      </div>

      <div style={card}>
        <h2 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 600 }}>Archivos (URLs de Vercel Blob)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div><label style={lbl}>URL Portada *</label><input style={inp} value={form.coverUrl} onChange={set('coverUrl')} placeholder="https://..." /></div>
          <div><label style={lbl}>URL PDF (privado)</label><input style={inp} value={form.pdfUrl ?? ''} onChange={set('pdfUrl')} placeholder="https://..." /></div>
          <div><label style={lbl}>URL EPUB (privado)</label><input style={inp} value={form.epubUrl ?? ''} onChange={set('epubUrl')} placeholder="https://..." /></div>
          <div><label style={lbl}>URL Extracto (público)</label><input style={inp} value={form.excerptPdfUrl ?? ''} onChange={set('excerptPdfUrl')} placeholder="https://..." /></div>
        </div>
      </div>

      <div style={card}>
        <h2 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 600 }}>Detalles</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div><label style={lbl}>Género</label><input style={inp} value={form.genre ?? ''} onChange={set('genre')} /></div>
          <div><label style={lbl}>Páginas</label><input type="number" style={inp} value={form.pageCount} onChange={set('pageCount')} /></div>
          <div><label style={lbl}>ISBN</label><input style={inp} value={form.isbn ?? ''} onChange={set('isbn')} /></div>
          <div><label style={lbl}>Fecha publicación</label><input type="date" style={inp} value={form.publishedAt} onChange={set('publishedAt')} /></div>
        </div>
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input type="checkbox" id="pub" checked={form.isPublished}
            onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
          <label htmlFor="pub" style={{ fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Publicado (visible para todos los visitantes)
          </label>
        </div>
      </div>

      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Precios por moneda</h2>
          <button onClick={() => setPrices(p => [...p, { currency: 'USD', amount: 0, isActive: true }])}
            style={{ background: '#f0f4ff', color: '#4a52ea', border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            + Agregar
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {prices.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select style={{ ...inp, width: '110px', flexShrink: 0 }} value={p.currency}
                onChange={e => setPrices(prev => prev.map((x, j) => j === i ? { ...x, currency: e.target.value } : x))}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" step="0.01" min="0" style={{ ...inp, flex: 1 }} placeholder="0.00" value={p.amount}
                onChange={e => setPrices(prev => prev.map((x, j) => j === i ? { ...x, amount: parseFloat(e.target.value) || 0 } : x))} />
              <button onClick={() => setPrices(prev => prev.filter((_, j) => j !== i))}
                style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontWeight: 700 }}>✕</button>
            </div>
          ))}
        </div>
      </div>

      {msg && <p style={{ marginBottom: '16px', fontSize: '14px' }}>{msg}</p>}

      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={handleSave} disabled={saving}
          style={{ padding: '12px 28px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear libro'}
        </button>
        {isEdit && (
          <button onClick={handleDelete}
            style={{ padding: '12px 28px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>
            Eliminar libro
          </button>
        )}
      </div>
    </div>
  );
}
