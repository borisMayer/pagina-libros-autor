'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Milestone { id?: string; year: number; labelEs: string; labelEn: string; }
interface AuthorData {
  id?: string; nameEs: string; nameEn: string; bioEs: string; bioEn: string;
  photoUrl?: string | null; birthDate?: Date | null; nationality?: string | null;
  website?: string | null; twitter?: string | null; instagram?: string | null;
  milestones?: Milestone[];
}

const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'system-ui' };
const lbl: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' };
const card: React.CSSProperties = { background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #f0ede6', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: '20px' };
const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' };

export default function AuthorForm({ initialData }: { initialData: AuthorData | null }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const [form, setForm] = useState({
    nameEs: initialData?.nameEs ?? '', nameEn: initialData?.nameEn ?? '',
    bioEs: initialData?.bioEs ?? '', bioEn: initialData?.bioEn ?? '',
    photoUrl: initialData?.photoUrl ?? '',
    birthDate: initialData?.birthDate ? new Date(initialData.birthDate).toISOString().split('T')[0] : '',
    nationality: initialData?.nationality ?? '', website: initialData?.website ?? '',
    twitter: initialData?.twitter ?? '', instagram: initialData?.instagram ?? '',
  });
  const [milestones, setMilestones] = useState<Milestone[]>(initialData?.milestones ?? []);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true); setMsg('');
    const res = await fetch('/api/author', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, milestones }),
    });
    setSaving(false);
    if (res.ok) { setMsg('✅ Guardado correctamente'); router.refresh(); }
    else setMsg('❌ Error al guardar');
  };

  return (
    <div>
      <div style={card}>
        <h2 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 600 }}>Información básica</h2>
        <div style={grid2}>
          <div><label style={lbl}>Nombre (ES)</label><input style={inp} value={form.nameEs} onChange={set('nameEs')} /></div>
          <div><label style={lbl}>Nombre (EN)</label><input style={inp} value={form.nameEn} onChange={set('nameEn')} /></div>
        </div>
        <div style={{ marginTop: '16px' }}>
          <label style={lbl}>Biografía (ES)</label>
          <textarea style={{ ...inp, minHeight: '120px', resize: 'vertical' }} value={form.bioEs} onChange={set('bioEs')} />
        </div>
        <div style={{ marginTop: '16px' }}>
          <label style={lbl}>Biografía (EN)</label>
          <textarea style={{ ...inp, minHeight: '120px', resize: 'vertical' }} value={form.bioEn} onChange={set('bioEn')} />
        </div>
      </div>

      <div style={card}>
        <h2 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 600 }}>Datos de contacto</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div><label style={lbl}>URL de foto</label><input style={inp} value={form.photoUrl} onChange={set('photoUrl')} placeholder="https://..." /></div>
          <div><label style={lbl}>Fecha de nacimiento</label><input type="date" style={inp} value={form.birthDate} onChange={set('birthDate')} /></div>
          <div><label style={lbl}>Nacionalidad</label><input style={inp} value={form.nationality} onChange={set('nationality')} /></div>
          <div><label style={lbl}>Sitio web</label><input style={inp} value={form.website} onChange={set('website')} /></div>
          <div><label style={lbl}>Twitter</label><input style={inp} value={form.twitter} onChange={set('twitter')} placeholder="usuario (sin @)" /></div>
          <div><label style={lbl}>Instagram</label><input style={inp} value={form.instagram} onChange={set('instagram')} placeholder="usuario (sin @)" /></div>
        </div>
      </div>

      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Cronología</h2>
          <button onClick={() => setMilestones(m => [...m, { year: new Date().getFullYear(), labelEs: '', labelEn: '' }])}
            style={{ background: '#f0f4ff', color: '#4a52ea', border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            + Agregar
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {milestones.map((ms, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="number" style={{ ...inp, width: '80px', flexShrink: 0 }} value={ms.year}
                onChange={e => setMilestones(m => m.map((x, j) => j === i ? { ...x, year: parseInt(e.target.value) } : x))} />
              <input style={{ ...inp, flex: 1 }} placeholder="Evento (ES)" value={ms.labelEs}
                onChange={e => setMilestones(m => m.map((x, j) => j === i ? { ...x, labelEs: e.target.value } : x))} />
              <input style={{ ...inp, flex: 1 }} placeholder="Event (EN)" value={ms.labelEn}
                onChange={e => setMilestones(m => m.map((x, j) => j === i ? { ...x, labelEn: e.target.value } : x))} />
              <button onClick={() => setMilestones(m => m.filter((_, j) => j !== i))}
                style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontWeight: 700 }}>✕</button>
            </div>
          ))}
        </div>
      </div>

      {msg && <p style={{ marginBottom: '16px', fontSize: '14px' }}>{msg}</p>}

      <button onClick={handleSave} disabled={saving}
        style={{ padding: '12px 28px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </div>
  );
}
