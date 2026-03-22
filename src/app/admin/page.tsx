import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard — Admin' };

const card = (bg = '#fff'): React.CSSProperties => ({
  background: bg, borderRadius: '16px', padding: '20px 24px',
  border: '1px solid #f0ede6', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
});

export default async function AdminDashboardPage() {
  const [totalSales, totalApproved, totalBooks, recentSales] = await Promise.all([
    prisma.sale.count(),
    prisma.sale.count({ where: { status: 'APPROVED' } }),
    prisma.book.count(),
    prisma.sale.findMany({
      where: { status: 'APPROVED' }, take: 10,
      orderBy: { createdAt: 'desc' },
      include: { book: { select: { titleEs: true } } },
    }),
  ]);

  const revenueGroups = await prisma.sale.groupBy({
    by: ['currency'], where: { status: 'APPROVED' }, _sum: { amount: true },
  });

  const STATUS_COLORS: Record<string, string> = {
    APPROVED: '#dcfce7', PENDING: '#fef9c3', REJECTED: '#fee2e2',
    PROCESSING: '#dbeafe', REFUNDED: '#f3e8ff', CANCELLED: '#f3f4f6',
  };
  const STATUS_TEXT: Record<string, string> = {
    APPROVED: '#15803d', PENDING: '#854d0e', REJECTED: '#dc2626',
    PROCESSING: '#1d4ed8', REFUNDED: '#7e22ce', CANCELLED: '#6b7280',
  };
  const STATUS_LABELS: Record<string, string> = {
    APPROVED: 'Aprobada', PENDING: 'Pendiente', REJECTED: 'Rechazada',
    PROCESSING: 'Procesando', REFUNDED: 'Reembolsada', CANCELLED: 'Cancelada',
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1a1a2e' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 700, marginBottom: '28px' }}>
        Panel de control
      </h1>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Ventas totales',    value: totalSales,          icon: '📊', color: '#ede9fe' },
          { label: 'Ventas aprobadas',  value: totalApproved,       icon: '✅', color: '#dcfce7' },
          { label: 'Libros publicados', value: totalBooks,           icon: '📚', color: '#dbeafe' },
          { label: 'Monedas activas',   value: revenueGroups.length, icon: '💱', color: '#fef9c3' },
        ].map(stat => (
          <div key={stat.label} style={{ ...card(stat.color), display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>{stat.icon}</span>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{stat.label}</p>
              <p style={{ margin: '2px 0 0', fontSize: '28px', fontWeight: 700 }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue */}
      {revenueGroups.length > 0 && (
        <div style={{ ...card(), marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', marginTop: 0 }}>Ingresos por moneda</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {revenueGroups.map(g => (
              <div key={g.currency} style={{ background: '#f0f4ff', borderRadius: '10px', padding: '10px 16px' }}>
                <p style={{ margin: 0, fontSize: '11px', color: '#4a52ea', fontWeight: 600 }}>{g.currency}</p>
                <p style={{ margin: '2px 0 0', fontSize: '20px', fontWeight: 700 }}>
                  {new Intl.NumberFormat('es-AR', { style: 'currency', currency: g.currency, minimumFractionDigits: 0 }).format(Number(g._sum.amount ?? 0))}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <Link href="/admin/libros/nuevo" style={{ padding: '10px 20px', background: '#1a1a2e', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
          + Nuevo libro
        </Link>
        <Link href="/admin/autor" style={{ padding: '10px 20px', background: '#f0f4ff', color: '#4a52ea', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
          Editar autor
        </Link>
      </div>

      {/* Recent sales */}
      <div style={card()}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', marginTop: 0 }}>Ventas recientes</h2>
        {recentSales.length === 0 ? (
          <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>
            No hay ventas aún. <Link href="/admin/libros/nuevo" style={{ color: '#4a52ea' }}>Carga tu primer libro →</Link>
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0ede6' }}>
                  {['Libro', 'Comprador', 'Monto', 'Estado', 'Fecha'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#9ca3af', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentSales.map(sale => (
                  <tr key={sale.id} style={{ borderBottom: '1px solid #fafafa' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 500 }}>{sale.book.titleEs}</td>
                    <td style={{ padding: '10px 12px', color: '#6b7280' }}>{sale.buyerEmail}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                      {new Intl.NumberFormat('es-AR', { style: 'currency', currency: sale.currency, minimumFractionDigits: 0 }).format(Number(sale.amount))}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: STATUS_COLORS[sale.status] ?? '#f3f4f6', color: STATUS_TEXT[sale.status] ?? '#6b7280' }}>
                        {STATUS_LABELS[sale.status] ?? sale.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#9ca3af' }}>
                      {sale.createdAt.toLocaleDateString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
