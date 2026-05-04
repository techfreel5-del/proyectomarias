import { CatalogGrid } from '@/components/customer/CatalogGrid';
import { getAllProducts } from '@/lib/products-db';

export const metadata = { title: 'Tienda · MARIASCLUB™' };

export default async function ShopPage() {
  const products = await getAllProducts();
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <p className="text-xs font-body font-semibold tracking-[0.2em] uppercase text-[#00C9B1] mb-2">
            MARIASCLUB™
          </p>
          <h1 className="font-display text-5xl sm:text-6xl font-black text-[#0A0A0A]">
            Explora el{' '}
            <span className="italic text-[#C0392B]">C</span>atálogo
            <br />
            Completo.
          </h1>
        </div>
        <CatalogGrid products={products} categoryLabel="Todos los Productos" />
      </div>
    </div>
  );
}
