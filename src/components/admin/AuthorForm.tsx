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

export default function AuthorForm({ initialData }: { initialData: AuthorData | null }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const [form, setForm] = useState({
    nameEs: initialData?.nameEs ?? '',
    nameEn: initialData?.nameEn ?? '',
    bioEs:  initialData?.bioEs  ?? '',
    bioEn:  initialData?.bioEn  ?? '',
    photoUrl: initialData?.photoUrl ?? '',
    birthDate: initialData?.birthDate ? new Date(initialData.birthDate).toISOString().split('T')[0] : '',
    nationality: initialData?.nationality ?? '',
    website:   initialData?.website   ?? '',
    twitter:   initialData?.twitter   ?? '',
    instagram: initialData?.instagram ?? '',
  });

  const [milestones, setMilestones] = useState<Milestone[]>(
    initialData?.milestones ?? []
  );

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const addMilestone = () =>
    setMilestones(m => [...m, { year: new Date().getFullYear(), labelEs: '', labelEn: '' }]);

  const removeMilestone = (i: number) =>
    setMilestones(m => m.filter((_, idx) => idx !== i));

  const updateMilestone = (i: number, k: keyof Milestone, v: string | number) =>
    setMilestones(m => m.map((ms, idx) => idx === i ? { ...ms, [k]: v } : ms));

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    const res = await fetch('/api/author', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, milestones }),
    });
    setSaving(false);
    if (res.ok) { setMsg('✅ Guardado correctamente'); router.refresh(); }
    else setMsg('❌ Error al guardar');
  };

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:outline-none font-body text-ink';
  const labelCls = 'block text-xs font-semibold text-ink/60 uppercase tracking-wide mb-2 font-body';

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelCls}>Nombre (ES)</label><input className={inputCls} value={form.nameEs} onChange={set('nameEs')} /></div>
        <div><label className={labelCls}>Nombre (EN)</label><input className={inputCls} value={form.nameEn} onChange={set('nameEn')} /></div>
      </div>

      <div><label className={labelCls}>Biografía (ES)</label><textarea className={inputCls} rows={5} value={form.bioEs} onChange={set('bioEs')} /></div>
      <div><label className={labelCls}>Biografía (EN)</label><textarea className={inputCls} rows={5} value={form.bioEn} onChange={set('bioEn')} /></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelCls}>URL de foto</label><input className={inputCls} value={form.photoUrl} onChange={set('photoUrl')} placeholder="https://..." /></div>
        <div><label className={labelCls}>Fecha de nacimiento</label><input type="date" className={inputCls} value={form.birthDate} onChange={set('birthDate')} /></div>
        <div><label className={labelCls}>Nacionalidad</label><input className={inputCls} value={form.nationality} onChange={set('nationality')} /></div>
        <div><label className={labelCls}>Sitio web</label><input className={inputCls} value={form.website} onChange={set('website')} /></div>
        <div><label className={labelCls}>Twitter</label><input className={inputCls} value={form.twitter} onChange={set('twitter')} placeholder="usuario (sin @)" /></div>
        <div><label className={labelCls}>Instagram</label><input className={inputCls} value={form.instagram} onChange={set('instagram')} placeholder="usuario (sin @)" /></div>
      </div>

      {/* Milestones */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className={labelCls + ' mb-0'}>Cronología biográfica</label>
          <button onClick={addMilestone} className="text-xs text-brand-600 font-semibold hover:underline font-body">+ Agregar</button>
        </div>
        <div className="space-y-3">
          {milestones.map((ms, i) => (
            <div key={i} className="flex gap-2 items-start">
              <input type="number" className="w-20 px-2 py-2 rounded-xl border border-gray-200 text-sm font-body" value={ms.year}
                onChange={e => updateMilestone(i, 'year', parseInt(e.target.value))} />
              <input className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm font-body" placeholder="Evento (ES)" value={ms.labelEs}
                onChange={e => updateMilestone(i, 'labelEs', e.target.value)} />
              <input className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm font-body" placeholder="Event (EN)" value={ms.labelEn}
                onChange={e => updateMilestone(i, 'labelEn', e.target.value)} />
              <button onClick={() => removeMilestone(i)} className="text-red-400 hover:text-red-600 px-2 py-2">✕</button>
            </div>
          ))}
        </div>
      </div>

      {msg && <p className="font-body text-sm">{msg}</p>}

      <button onClick={handleSave} disabled={saving}
        className="px-6 py-3 bg-ink hover:bg-brand-900 text-white font-bold rounded-xl transition-all font-body disabled:opacity-60">
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </div>
  );
}
