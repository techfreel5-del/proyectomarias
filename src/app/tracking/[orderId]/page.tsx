import { notFound } from 'next/navigation';
import { TrackingTimeline } from '@/components/customer/TrackingTimeline';
import { trackingEvents, orders } from '@/lib/mock-data';

interface Props {
  params: Promise<{ orderId: string }>;
}

export async function generateStaticParams() {
  return orders.map((o) => ({ orderId: o.id }));
}

export async function generateMetadata({ params }: Props) {
  const { orderId } = await params;
  return { title: `Tracking · ${orderId}` };
}

export default async function TrackingPage({ params }: Props) {
  const { orderId } = await params;

  const order = orders.find((o) => o.id === orderId);
  if (!order) notFound();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <TrackingTimeline events={trackingEvents} orderId={orderId} />
    </div>
  );
}
