export function AnnouncementBar() {
  const msg = 'Venta de Fin de Año — 25% de descuento en toda la colección';
  const items = Array(8).fill(msg);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-[#0A0A0A] text-white overflow-hidden h-8 flex items-center">
      <div
        className="flex gap-10 whitespace-nowrap animate-marquee"
        style={{ animation: 'marquee 20s linear infinite' }}
      >
        {items.map((text, i) => (
          <span key={i} className="text-[11px] font-body font-medium tracking-[0.18em] uppercase flex items-center gap-6">
            {text}
            <span className="text-white/30">·</span>
          </span>
        ))}
        {/* Duplicate for seamless loop */}
        {items.map((text, i) => (
          <span key={`b-${i}`} className="text-[11px] font-body font-medium tracking-[0.18em] uppercase flex items-center gap-6">
            {text}
            <span className="text-white/30">·</span>
          </span>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
