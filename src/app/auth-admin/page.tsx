'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/admin';

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // NextAuth v5 usa /api/auth/callback/credentials con CSRF token
      // Primero obtenemos el CSRF token
      const csrfRes  = await fetch('/api/auth/csrf');
      const csrfData = await csrfRes.json();
      const csrfToken = csrfData.csrfToken;

      // Llamada directa al endpoint de NextAuth v5
      const res = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          email,
          password,
          csrfToken,
          callbackUrl,
          json: 'true',
        }),
        redirect: 'follow',
      });

      // Si redirigió al admin, el login fue exitoso
      if (res.url.includes('/admin') && !res.url.includes('/auth-admin')) {
        router.push('/admin');
        router.refresh();
        return;
      }

      // Verificar si hay sesión activa
      const sessionRes  = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();

      if (sessionData?.user?.email) {
        router.push(callbackUrl);
        router.refresh();
        return;
      }

      setError('Credenciales incorrectas. Verifica email y contraseña.');
    } catch (err) {
      console.error('Login error:', err);
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const s: Record<string, React.CSSProperties> = {
    page:     { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', padding: '1.5rem' },
    card:     { width: '100%', maxWidth: '420px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '2.5rem' },
    title:    { fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: '#1a1a2e', textAlign: 'center', margin: 0 },
    subtitle: { color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center', marginTop: '6px', marginBottom: '2rem' },
    label:    { display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '6px' },
    input:    { width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' as const, transition: 'border-color 0.2s' },
    field:    { marginBottom: '1.25rem' },
    error:    { backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1.25rem' },
    btn:      { width: '100%', padding: '0.85rem', backgroundColor: '#1a1a2e', color: '#fff', fontWeight: 700, borderRadius: '10px', border: 'none', fontSize: '1rem', cursor: 'pointer', transition: 'opacity 0.2s' },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <p style={s.title}>Andrew Myer</p>
        <p style={s.subtitle}>Panel de administración</p>

        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>Correo electrónico</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required style={s.input} placeholder="admin@andrewmyer.com"
              autoComplete="email"
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Contraseña</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              required style={s.input} placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && <div style={s.error}>{error}</div>}

          <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Verificando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AuthAdminPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
        <p style={{ color: '#9ca3af' }}>Cargando...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
