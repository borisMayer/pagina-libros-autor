import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Ventas — Admin' };

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  APPROVED:   { label: 'Aprobada',    color: 'bg-green-100 text-green-800' },
  PENDING:    { label: 'Pendiente',   color: 'bg-yellow-100 text-yellow-800' },
  REJECTED:   { label: 'Rechazada',   color: 'bg-red-100 text-red-800' },
  PROCESSING: { label: 'Procesando',  color: 'bg-blue-100 text-blue-800' },
  REFUNDED:   { label: 'Reembolsada', color: 'bg-purple-100 text-purple-800' },
  CANCELLED:  { label: 'Cancelada',   color: 'bg-gray-100 text-gray-600' },
};

export default async function AdminVentasPage() {
  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      book: { select: { titleEs: true, coverUrl: true } },
      downloadLogs: true,
    },
  });

  return (
    <div className="animate-fadeIn">
      <h1 className="font-display text-3xl font-bold text-ink mb-8">Ventas</h1>

      {sales.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-4">💳</p>
          <p className="font-body text-ink/50">No hay ventas aún.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Libro', 'Comprador', 'Monto', 'Estado', 'Descargas', 'Fecha'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-ink/50 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sales.map(sale => {
                  const st = STATUS_LABELS[sale.status] ?? { label: sale.status, color: 'bg-gray-100' };
                  return (
                    <tr key={sale.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-ink max-w-[160px] truncate">{sale.book.titleEs}</td>
                      <td className="py-3 px-4 text-ink/70">
                        <div>{sale.buyerEmail}</div>
                        {sale.buyerName && <div className="text-xs text-ink/40">{sale.buyerName}</div>}
                      </td>
                      <td className="py-3 px-4 font-semibold text-ink">
                        {new Intl.NumberFormat('es-AR', { style: 'currency', currency: sale.currency }).format(Number(sale.amount))}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-ink/50">
                        {sale.downloadLogs.length}/{sale.maxDownloads}
                      </td>
                      <td className="py-3 px-4 text-ink/50 whitespace-nowrap">
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
