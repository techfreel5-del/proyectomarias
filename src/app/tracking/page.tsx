import { OrderLookupForm } from './OrderLookupForm';

export const metadata = { title: 'Rastrear Pedido · MARIASCLUB™' };

export default function TrackingLookupPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center mb-10">
        <p className="text-xs font-body font-semibold tracking-[0.2em] uppercase text-[#00C9B1] mb-2">Seguimiento de Pedido</p>
        <h1 className="font-display text-4xl sm:text-5xl font-black text-[#0A0A0A] mb-3">Rastrea tu pedido</h1>
        <p className="text-base text-[#6B6359]">Ingresa tu número de pedido para ver el estado de entrega en tiempo real.</p>
      </div>
      <OrderLookupForm />
    </div>
  );
}
