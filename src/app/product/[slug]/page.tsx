import { ProductDetail } from '@/components/customer/ProductDetail';
import { getAllSlugs, getProductBySlugDB } from '@/lib/products-db';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlugDB(slug);
  return {
    title: product?.name ?? 'Producto no encontrado',
    description: product?.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlugDB(slug);

  if (!product) notFound();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <ProductDetail product={product} />
    </div>
  );
}
