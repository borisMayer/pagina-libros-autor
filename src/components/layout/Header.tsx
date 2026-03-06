'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/navigation';
import { useState } from 'react';

export default function Header() {
  const t = useLocale();
  const nav = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const toggleLocale = () => {
    const next = locale === 'es' ? 'en' : 'es';
    router.replace(pathname, { locale: next });
  };

  return (
    <header className="sticky top-0 z-50 bg-ink/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-display text-xl font-bold text-white hover:text-brand-400 transition-colors">
          Boris Mayer
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/biografia" className="text-white/80 hover:text-white font-body text-sm transition-colors">
            {nav('biography')}
          </Link>
          <Link href="/libros" className="text-white/80 hover:text-white font-body text-sm transition-colors">
            {nav('books')}
          </Link>
          <button
            onClick={toggleLocale}
            className="px-3 py-1.5 rounded-md border border-white/20 text-white/70 hover:text-white hover:border-white/40 font-body text-xs font-medium transition-all"
          >
            {locale === 'es' ? '🇬🇧 EN' : '🇦🇷 ES'}
          </button>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <div className="w-5 h-0.5 bg-white mb-1 transition-all" style={{ transform: open ? 'rotate(45deg) translate(2px, 6px)' : 'none' }} />
          <div className="w-5 h-0.5 bg-white mb-1" style={{ opacity: open ? 0 : 1 }} />
          <div className="w-5 h-0.5 bg-white transition-all" style={{ transform: open ? 'rotate(-45deg) translate(2px, -6px)' : 'none' }} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-ink border-t border-white/10 px-6 py-4 flex flex-col gap-4">
          <Link href="/biografia" onClick={() => setOpen(false)} className="text-white/80 font-body text-sm py-2">
            {nav('biography')}
          </Link>
          <Link href="/libros" onClick={() => setOpen(false)} className="text-white/80 font-body text-sm py-2">
            {nav('books')}
          </Link>
          <button onClick={toggleLocale} className="text-left text-white/70 font-body text-sm py-2">
            {locale === 'es' ? '🇬🇧 Switch to English' : '🇦🇷 Cambiar a Español'}
          </button>
        </div>
      )}
    </header>
  );
}
