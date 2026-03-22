'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const NAV = [
  { href: '/admin',        label: 'Dashboard',  icon: '📊' },
  { href: '/admin/libros', label: 'Libros',      icon: '📚' },
  { href: '/admin/autor',  label: 'Autor',       icon: '✍️'  },
  { href: '/admin/ventas', label: 'Ventas',      icon: '💳' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const navLink = (active: boolean): React.CSSProperties => ({
    display:        'flex',
    alignItems:     'center',
    gap:            '10px',
    padding:        '10px 14px',
    borderRadius:   '8px',
    textDecoration: 'none',
    fontSize:       '14px',
    fontWeight:     500,
    color:          active ? '#ffffff' : 'rgba(255,255,255,0.6)',
    background:     active ? 'rgba(255,255,255,0.15)' : 'transparent',
    transition:     'all 0.15s',
    marginBottom:   '2px',
  });

  return (
    <aside style={{
      width:        '220px',
      minHeight:    '100vh',
      background:   '#1a1a2e',
      display:      'flex',
      flexDirection:'column',
      padding:      '24px 16px',
      flexShrink:   0,
    }}>
      <div style={{ marginBottom: '28px', paddingLeft: '4px' }}>
        <p style={{ color: '#fff', fontWeight: 700, fontSize: '17px', margin: 0, fontFamily: 'Georgia, serif' }}>
          Andrew Myer
        </p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '4px 0 0' }}>
          Administración
        </p>
      </div>

      <nav style={{ flex: 1 }}>
        {NAV.map(item => {
          const active = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} style={navLink(active)}>
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', marginTop: '16px' }}>
        <Link href="/" style={navLink(false)}>
          <span>🌐</span> Ver sitio
        </Link>
        <button onClick={() => signOut({ callbackUrl: '/auth-admin' })}
          style={{ ...navLink(false), background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
          <span>🚪</span> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
