import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/Sidebar';
import '../globals.css';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    redirect('/auth-admin');
  }

  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb' }}>
        <div style={{ minHeight: '100vh', display: 'flex' }}>
          <AdminSidebar />
          <main style={{ flex: 1, overflow: 'auto', padding: '2rem' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
