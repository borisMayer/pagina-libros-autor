import { Link } from '@/i18n/navigation';

export default function Footer() {
  return (
    <footer className="bg-ink text-white/60 py-10 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-display text-lg font-semibold text-white">Boris Mayer</p>
        <nav className="flex gap-6 font-body text-sm">
          <Link href="/biografia" className="hover:text-white transition-colors">Biografía</Link>
          <Link href="/libros" className="hover:text-white transition-colors">Libros</Link>
        </nav>
        <p className="font-body text-xs">
          © {new Date().getFullYear()} Boris Mayer. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
