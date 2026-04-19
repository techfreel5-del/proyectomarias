export default function TiendaLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#FAFAFA] antialiased">
        {children}
      </body>
    </html>
  );
}
