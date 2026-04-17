import { ProductDetail } from '@/components/customer/ProductDetail';
import { products, getProductBySlug } from '@/lib/mock-data';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  return {
    title: product?.name ?? 'Product Not Found',
    description: product?.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) notFound();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <ProductDetail product={product} />
    </div>
  );
}
