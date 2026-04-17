export const metadata = { title: 'Returns & Exchanges · MARIASCLUB™' };

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <p className="text-xs font-body font-semibold tracking-[0.2em] uppercase text-[#00C9B1] mb-2">Customer Care</p>
        <h1 className="font-display text-5xl font-black text-[#0A0A0A] mb-10">Returns & Exchanges</h1>

        <div className="space-y-10 text-[#6B6359] leading-relaxed">
          <section>
            <h2 className="font-body text-lg font-bold text-[#0A0A0A] mb-3">30-Day Return Policy</h2>
            <p>We accept returns on most items within 30 days of delivery. Items must be in their original condition — unworn, unwashed, with all tags attached. Packaging should be intact.</p>
          </section>

          <section>
            <h2 className="font-body text-lg font-bold text-[#0A0A0A] mb-3">How to Start a Return</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Contact us at hola@mariasclub.mx with your order number and reason for return.</li>
              <li>We'll send you a prepaid return label within one business day.</li>
              <li>Drop off the package at any listed carrier point. Your refund is processed within 5–7 business days of receipt.</li>
            </ol>
          </section>

          <section>
            <h2 className="font-body text-lg font-bold text-[#0A0A0A] mb-3">Exchanges</h2>
            <p>Need a different size or colour? Exchanges are handled the same way as returns. Once we receive your original item, we'll dispatch the replacement immediately — shipping is on us.</p>
          </section>

          <section>
            <h2 className="font-body text-lg font-bold text-[#0A0A0A] mb-3">Refund Timeline</h2>
            <p>Refunds are issued to the original payment method. Once approved, allow 3–5 business days for the amount to appear on your statement, depending on your bank or card issuer.</p>
          </section>

          <section>
            <h2 className="font-body text-lg font-bold text-[#0A0A0A] mb-3">Non-Returnable Items</h2>
            <p>For hygiene and safety reasons, the following cannot be returned: underwear, pierced jewellery, opened personal care products, and items marked as final sale at time of purchase.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
