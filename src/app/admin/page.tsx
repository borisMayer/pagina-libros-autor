import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard — Admin' };

export default async function AdminDashboardPage() {
  const [totalSales, totalApproved, totalBooks, recentSales] = await Promise.all([
    prisma.sale.count(),
    prisma.sale.count({ where: { status: 'APPROVED' } }),
    prisma.book.count(),
    prisma.sale.findMany({
      where:   { status: 'APPROVED' },
      take:    10,
      orderBy: { createdAt: 'desc' },
      include: { book: { select: { titleEs: true } } },
    }),
  ]);

  // Revenue by currency
  const revenueGroups = await prisma.sale.groupBy({
    by:     ['currency'],
    where:  { status: 'APPROVED' },
    _sum:   { amount: true },
  });

  const STATUS_COLORS: Record<string, string> = {
    APPROVED: 'bg-green-100 text-green-800',
    PENDING:  'bg-yellow-100 text-yellow-800',
    REJECTED: 'bg-red-100 text-red-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="animate-fadeIn">
      <h1 className="font-display text-3xl font-bold text-ink mb-8">Panel de control</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Ventas totales',    value: totalSales,    icon: '📊' },
          { label: 'Ventas aprobadas',  value: totalApproved, icon: '✅' },
          { label: 'Libros publicados', value: totalBooks,    icon: '📚' },
          { label: 'Monedas activas',   value: revenueGroups.length, icon: '💱' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <p className="text-sm text-ink/50 font-body">{stat.label}</p>
            </div>
            <p className="font-display text-4xl font-bold text-ink">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue by currency */}
      {revenueGroups.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-10">
          <h2 className="font-display text-xl font-bold text-ink mb-4">Ingresos por moneda</h2>
          <div className="flex flex-wrap gap-4">
            {revenueGroups.map(g => (
              <div key={g.currency} className="bg-brand-50 border border-brand-200 rounded-xl px-5 py-3">
                <p className="text-xs text-brand-600 font-semibold font-body">{g.currency}</p>
                <p className="font-display text-2xl font-bold text-ink">
                  {new Intl.NumberFormat('es-AR', { style: 'currency', currency: g.currency }).format(Number(g._sum.amount ?? 0))}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent sales */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-display text-xl font-bold text-ink mb-4">Ventas recientes</h2>
        {recentSales.length === 0 ? (
          <p className="text-ink/40 font-body text-sm">No hay ventas aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 text-ink/50 font-semibold">Libro</th>
                  <th className="text-left py-3 px-2 text-ink/50 font-semibold">Comprador</th>
                  <th className="text-left py-3 px-2 text-ink/50 font-semibold">Monto</th>
                  <th className="text-left py-3 px-2 text-ink/50 font-semibold">Estado</th>
                  <th className="text-left py-3 px-2 text-ink/50 font-semibold">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map(sale => (
                  <tr key={sale.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-2 font-medium text-ink">{sale.book.titleEs}</td>
                    <td className="py-3 px-2 text-ink/70">{sale.buyerEmail}</td>
                    <td className="py-3 px-2 font-semibold text-ink">
                      {new Intl.NumberFormat('es-AR', { style: 'currency', currency: sale.currency }).format(Number(sale.amount))}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[sale.status] ?? 'bg-gray-100'}`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-ink/50">
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
