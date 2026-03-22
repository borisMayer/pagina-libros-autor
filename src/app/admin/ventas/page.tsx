import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Ventas — Admin' };

const STATUS: Record<string, [string, string]> = {
  APPROVED:   ['Aprobada',    '#dcfce7/#15803d'],
  PENDING:    ['Pendiente',   '#fef9c3/#854d0e'],
  REJECTED:   ['Rechazada',   '#fee2e2/#dc2626'],
  PROCESSING: ['Procesando',  '#dbeafe/#1d4ed8'],
  REFUNDED:   ['Reembolsada', '#f3e8ff/#7e22ce'],
  CANCELLED:  ['Cancelada',   '#f3f4f6/#6b7280'],
};

export default async function AdminVentasPage() {
  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      book:         { select: { titleEs: true, coverUrl: true } },
      downloadLogs: true,
    },
  });

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1a1a2e' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 700, marginBottom: '28px' }}>Ventas</h1>

      {sales.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', border: '1px solid #f0ede6' }}>
          <p style={{ fontSize: '40px', marginBottom: '12px' }}>💳</p>
          <p style={{ color: '#9ca3af' }}>No hay ventas aún.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f0ede6', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '2px solid #f0ede6' }}>
                  {['Libro', 'Comprador', 'Monto', 'Estado', 'Descargas', 'Fecha'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#9ca3af', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sales.map(sale => {
                  const [label, colors] = STATUS[sale.status] ?? ['Desconocido', '#f3f4f6/#6b7280'];
                  const [bg, fg] = colors.split('/');
                  return (
                    <tr key={sale.id} style={{ borderBottom: '1px solid #fafafa' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 500 }}>{sale.book.titleEs}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7280' }}>
                        <div>{sale.buyerEmail}</div>
                        {sale.buyerName && <div style={{ fontSize: '12px', color: '#9ca3af' }}>{sale.buyerName}</div>}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                        {new Intl.NumberFormat('es-AR', { style: 'currency', currency: sale.currency, minimumFractionDigits: 0 }).format(Number(sale.amount))}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: bg, color: fg }}>
                          {label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#6b7280' }}>
                        {sale.downloadLogs.length}/{sale.maxDownloads}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                        {sale.createdAt.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
