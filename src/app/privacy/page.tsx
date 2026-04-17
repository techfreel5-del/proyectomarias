export const metadata = { title: 'Privacy Policy · MARIASCLUB™' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <p className="text-xs font-body font-semibold tracking-[0.2em] uppercase text-[#00C9B1] mb-2">Legal</p>
        <h1 className="font-display text-5xl font-black text-[#0A0A0A] mb-2">Privacy Policy</h1>
        <p className="text-sm text-[#B8B2A8] mb-10">Last updated: April 2026</p>

        <div className="space-y-10 text-[#6B6359] leading-relaxed text-sm">
          <section>
            <h2 className="font-body text-base font-bold text-[#0A0A0A] mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly — name, email address, shipping address, and payment details — when you place an order or create an account. We also collect usage data automatically, including pages visited, device type, and browser information.</p>
          </section>

          <section>
            <h2 className="font-body text-base font-bold text-[#0A0A0A] mb-3">2. How We Use Your Information</h2>
            <p>Your information is used to process and fulfil orders, send order confirmations and tracking updates, provide customer support, and improve our services. We may also send you promotional emails if you have opted in — you can unsubscribe at any time.</p>
          </section>

          <section>
            <h2 className="font-body text-base font-bold text-[#0A0A0A] mb-3">3. Sharing of Information</h2>
            <p>We do not sell your personal data. We share information only with trusted service providers who help us operate our business — including payment processors, shipping partners, and analytics services — and only to the extent necessary. All partners are contractually bound to protect your data.</p>
          </section>

          <section>
            <h2 className="font-body text-base font-bold text-[#0A0A0A] mb-3">4. Cookies</h2>
            <p>We use cookies to maintain your session, remember your preferences, and analyse site traffic. Essential cookies cannot be disabled as they are necessary for the site to function. You can manage non-essential cookies through your browser settings.</p>
          </section>

          <section>
            <h2 className="font-body text-base font-bold text-[#0A0A0A] mb-3">5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data at any time. You may also request a portable copy of your data or object to its processing. To exercise any of these rights, contact us at hola@mariasclub.mx.</p>
          </section>

          <section>
            <h2 className="font-body text-base font-bold text-[#0A0A0A] mb-3">6. Data Retention</h2>
            <p>We retain personal data for as long as necessary to fulfil the purposes described in this policy and to comply with legal obligations. Order records are retained for a minimum of five years as required by Mexican tax law.</p>
          </section>

          <section>
            <h2 className="font-body text-base font-bold text-[#0A0A0A] mb-3">7. Contact</h2>
            <p>For privacy-related questions or requests, contact our data team at hola@mariasclub.mx. We will respond within 10 business days.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
