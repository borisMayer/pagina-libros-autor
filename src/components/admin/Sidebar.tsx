'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const NAV_ITEMS = [
  { href: '/admin',         label: 'Dashboard',  icon: '📊' },
  { href: '/admin/libros',  label: 'Libros',     icon: '📚' },
  { href: '/admin/autor',   label: 'Autor',      icon: '✍️' },
  { href: '/admin/ventas',  label: 'Ventas',     icon: '💳' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-ink min-h-screen flex flex-col py-6 px-4 shrink-0">
      <div className="mb-8 px-2">
        <p className="font-display text-lg font-bold text-white">Andrew Myer</p>
        <p className="text-white/40 text-xs font-body mt-1">Administración</p>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`admin-nav-link ${
              pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                ? 'bg-white/15 text-white'
                : 'text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>{item.icon}</span>
            <span className="font-body text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="border-t border-white/10 pt-4 mt-4 flex flex-col gap-2">
        <Link href="/" className="admin-nav-link text-white/50 hover:bg-white/10 hover:text-white">
          <span>🌐</span>
          <span className="font-body text-sm">Ver sitio</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/auth-admin' })}
          className="admin-nav-link text-white/50 hover:bg-white/10 hover:text-white w-full text-left"
        >
          <span>🚪</span>
          <span className="font-body text-sm">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
