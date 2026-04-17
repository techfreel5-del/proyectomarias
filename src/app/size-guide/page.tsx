export const metadata = { title: 'Size Guide · MARIASCLUB™' };

const clothingSizes = [
  { size: 'XS', chest: '80–84', waist: '62–66', hips: '87–91', eu: '34', uk: '6', us: '2' },
  { size: 'S', chest: '85–89', waist: '67–71', hips: '92–96', eu: '36', uk: '8', us: '4' },
  { size: 'M', chest: '90–94', waist: '72–76', hips: '97–101', eu: '38', uk: '10', us: '6' },
  { size: 'L', chest: '95–99', waist: '77–81', hips: '102–106', eu: '40', uk: '12', us: '8' },
  { size: 'XL', chest: '100–104', waist: '82–86', hips: '107–111', eu: '42', uk: '14', us: '10' },
];

const shoeSizes = [
  { eu: '36', uk: '3', us: '5.5', cm: '22.5' },
  { eu: '37', uk: '4', us: '6.5', cm: '23.5' },
  { eu: '38', uk: '5', us: '7.5', cm: '24' },
  { eu: '39', uk: '6', us: '8.5', cm: '25' },
  { eu: '40', uk: '6.5', us: '9', cm: '25.5' },
  { eu: '41', uk: '7', us: '9.5', cm: '26' },
];

export default function SizeGuidePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <p className="text-xs font-body font-semibold tracking-[0.2em] uppercase text-[#00C9B1] mb-2">Shopping</p>
        <h1 className="font-display text-5xl font-black text-[#0A0A0A] mb-10">Size Guide</h1>

        <div className="space-y-12 text-[#6B6359]">
          {/* Clothing */}
          <section>
            <h2 className="font-body text-lg font-bold text-[#0A0A0A] mb-4">Clothing — Measurements in cm</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#EDEBE8]">
                    {['Size', 'Chest', 'Waist', 'Hips', 'EU', 'UK', 'US'].map((h) => (
                      <th key={h} className="py-3 pr-4 text-left text-xs font-bold uppercase tracking-wider text-[#8F8780]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clothingSizes.map((row) => (
                    <tr key={row.size} className="border-b border-[#F7F6F5]">
                      <td className="py-3 pr-4 font-semibold text-[#0A0A0A]">{row.size}</td>
                      <td className="py-3 pr-4">{row.chest}</td>
                      <td className="py-3 pr-4">{row.waist}</td>
                      <td className="py-3 pr-4">{row.hips}</td>
                      <td className="py-3 pr-4">{row.eu}</td>
                      <td className="py-3 pr-4">{row.uk}</td>
                      <td className="py-3 pr-4">{row.us}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Footwear */}
          <section>
            <h2 className="font-body text-lg font-bold text-[#0A0A0A] mb-4">Footwear</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#EDEBE8]">
                    {['EU', 'UK', 'US', 'Length (cm)'].map((h) => (
                      <th key={h} className="py-3 pr-4 text-left text-xs font-bold uppercase tracking-wider text-[#8F8780]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shoeSizes.map((row) => (
                    <tr key={row.eu} className="border-b border-[#F7F6F5]">
                      <td className="py-3 pr-4 font-semibold text-[#0A0A0A]">{row.eu}</td>
                      <td className="py-3 pr-4">{row.uk}</td>
                      <td className="py-3 pr-4">{row.us}</td>
                      <td className="py-3 pr-4">{row.cm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* How to measure */}
          <section className="bg-white rounded-2xl border border-[#EDEBE8] p-6">
            <h2 className="font-body text-lg font-bold text-[#0A0A0A] mb-4">How to Measure</h2>
            <ul className="space-y-2 text-sm">
              <li><span className="font-semibold text-[#0A0A0A]">Chest:</span> Measure around the fullest part of your chest, keeping the tape horizontal.</li>
              <li><span className="font-semibold text-[#0A0A0A]">Waist:</span> Measure around your natural waistline — the narrowest part of your torso.</li>
              <li><span className="font-semibold text-[#0A0A0A]">Hips:</span> Stand with feet together and measure around the fullest part of your hips.</li>
              <li><span className="font-semibold text-[#0A0A0A]">Foot length:</span> Stand on a flat surface and measure from heel to longest toe.</li>
            </ul>
            <p className="text-xs text-[#B8B2A8] mt-4">Between sizes? We recommend sizing up for a relaxed fit or sizing down for a more tailored silhouette.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
