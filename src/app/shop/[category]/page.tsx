import { CatalogGrid } from '@/components/customer/CatalogGrid';
import { products, Category, categoryLabels } from '@/lib/mock-data';
import { notFound } from 'next/navigation';

const validCategories: Category[] = ['fashion', 'home-kitchen', 'sports-fitness', 'electronics'];

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return validCategories.map((cat) => ({ category: cat }));
}

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  const label = categoryLabels[category as Category] ?? category;
  return { title: label };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;

  if (!validCategories.includes(category as Category)) {
    notFound();
  }

  const cat = category as Category;
  const filtered = products.filter((p) => p.category === cat);
  const label = categoryLabels[cat];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <p className="text-xs font-body font-semibold tracking-[0.2em] uppercase text-[#00C9B1] mb-2">
            Category
          </p>
          <h1 className="font-display text-5xl sm:text-6xl font-black text-[#0A0A0A] italic">
            {label}
          </h1>
          <p className="text-base text-[#6B6359] mt-3">{filtered.length} products</p>
        </div>
        <CatalogGrid products={filtered} categoryLabel={label} />
      </div>
    </div>
  );
}
