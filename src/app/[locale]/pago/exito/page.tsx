import { Suspense } from 'react';
import PagoExitoContent from './PagoExitoContent';

export default function PagoExitoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-parchment">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-body text-ink/70">Cargando...</p>
        </div>
      </div>
    }>
      <PagoExitoContent />
    </Suspense>
  );
}
