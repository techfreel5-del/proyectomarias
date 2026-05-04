import { HeroSection } from '@/components/customer/HeroSection';
import { CategoryStrips } from '@/components/customer/CategoryStrips';
import { FeaturedProducts } from '@/components/customer/FeaturedProducts';
import { TrendReport } from '@/components/customer/TrendReport';
import { TrackingPreview } from '@/components/customer/TrackingPreview';
import { NewsletterBanner } from '@/components/customer/NewsletterBanner';
import { CategorySplit } from '@/components/customer/CategorySplit';
import { getFeaturedProductsDB } from '@/lib/products-db';

export default async function HomePage() {
  const featuredProducts = await getFeaturedProductsDB();

  return (
    <>
      <HeroSection />
      <FeaturedProducts products={featuredProducts} />
      <CategoryStrips />
      <TrendReport />
      <CategorySplit />
      <TrackingPreview />
      <NewsletterBanner />
    </>
  );
}
