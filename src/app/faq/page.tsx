import { FAQContent } from './FAQContent';

export const metadata = { title: 'FAQ · MARIASCLUB™' };

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <p className="text-xs font-body font-semibold tracking-[0.2em] uppercase text-[#00C9B1] mb-2">Soporte</p>
        <h1 className="font-display text-5xl font-black text-[#0A0A0A] mb-10">Preguntas Frecuentes</h1>
        <div className="bg-white rounded-2xl border border-[#EDEBE8] px-6 py-2">
          <FAQContent />
        </div>
      </div>
    </div>
  );
}
