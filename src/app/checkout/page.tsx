import { CheckoutStepper } from '@/components/customer/CheckoutStepper';

export const metadata = { title: 'Checkout' };

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="border-b border-[#EDEBE8] bg-white py-4">
        <div className="max-w-2xl mx-auto px-4">
          <p className="text-center text-sm font-body font-medium text-[#6B6359]">
            🔒 Secure Checkout · MARIASCLUB™
          </p>
        </div>
      </div>
      <CheckoutStepper />
    </div>
  );
}
