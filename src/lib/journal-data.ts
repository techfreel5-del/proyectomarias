export interface Article {
  id: string;
  slug: string;
  tag: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  body: string[];
}

export const articles: Article[] = [
  {
    id: 'a1',
    slug: 'modern-wardrobe',
    tag: 'Fashion',
    title: 'Trend Report: The Modern Wardrobe',
    excerpt: 'Seasonal essentials — style & form with versatile, let-less-be-more linen tailoring.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80',
    date: 'March 28, 2026',
    body: [
      'The modern wardrobe is defined not by quantity but by intention. Each piece should earn its place — functional, beautiful, and versatile enough to carry you from morning meetings to evening gatherings without a second thought.',
      'Linen tailoring has emerged as the cornerstone of this new approach. Lightweight yet structured, it brings an effortless elegance that synthetic fabrics simply cannot replicate. The key is fit: slightly relaxed through the body, clean at the shoulders, with a hem that grazes the hip.',
      'Neutrals remain the foundation — sand, ivory, warm black — but this season sees a quiet introduction of sage and dusty rose as accent tones. These hues pair naturally with the earthy palette that anchors a considered wardrobe.',
      'Accessories are where personality lives. A single quality leather piece — a structured tote, a classic belt — elevates any outfit instantly. Invest in fewer, better items and resist the pull of trend-driven impulse buys.',
      'The result is a closet that feels curated, not cluttered. Open it in the morning and every option is a good one. That is the promise of the modern wardrobe, and it is entirely within reach.',
    ],
  },
  {
    id: 'a2',
    slug: 'seasonal-essentials',
    tag: 'Lifestyle',
    title: 'Seasonal Essentials: Style & Care',
    excerpt: 'Timeless pieces that transition seamlessly from morning to evening.',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1200&q=80',
    date: 'March 20, 2026',
    body: [
      'Transitional dressing is an art. As seasons shift, the challenge is maintaining a polished appearance without overhauling your entire wardrobe. The answer lies in a handful of seasonal essentials that bridge the gap.',
      'A fine-knit cashmere-blend sweater is the quintessential transitional piece. Light enough for early autumn evenings, substantial enough for a cool spring morning. Layer it over a crisp shirt or wear it alone — it always looks intentional.',
      'Care is as important as the initial purchase. Natural fibres reward attention: wash cold, lay flat to dry, fold rather than hang. A well-maintained garment lasts years; a neglected one seasons.',
      'Footwear anchors the seasonal transition. A leather ankle boot in tan or black moves easily from casual to semi-formal contexts. Choose a block heel for comfort over long days, and invest in a good leather conditioner to protect against changing weather.',
      'Finally, consider the bag. A structured leather tote large enough for a laptop and a change of shoes becomes your daily companion through every season. Buy once, buy well.',
    ],
  },
  {
    id: 'a3',
    slug: 'minimal-living',
    tag: 'Home',
    title: 'Minimal Living, Maximum Impact',
    excerpt: 'How thoughtful objects can transform your daily rituals.',
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1200&q=80',
    date: 'March 12, 2026',
    body: [
      'Minimalism in the home is not about deprivation — it is about curation. Every object you live with should serve a purpose, evoke a feeling, or do both. The rest is noise.',
      'Begin in the kitchen, where clutter is most insidious. A single high-performance blender replaces three lesser appliances. A pour-over coffee maker transforms your morning ritual into a mindful practice rather than a transaction with a pod machine.',
      'Textiles carry the emotional weight of a room. A stonewashed linen throw in oatmeal or sage introduces warmth without visual chaos. The waffle weave of a quality bath towel feels indulgent every single morning — small pleasures compound.',
      'Ceramics and wood bring natural texture that no synthetic surface can replicate. An end-grain oak cutting board displayed on a counter is simultaneously practical and beautiful. Handcrafted dinnerware makes every meal feel considered.',
      'The ritual of living well does not require more — it requires better. Choose objects made with care, maintain them with attention, and your home becomes a place that actively restores rather than depletes you.',
    ],
  },
  {
    id: 'a4',
    slug: 'performance-edit',
    tag: 'Sports',
    title: 'The Performance Edit',
    excerpt: 'Equipment and apparel chosen for function, designed to last.',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=1200&q=80',
    date: 'March 5, 2026',
    body: [
      'Performance gear has crossed into everyday life. The best yoga mat, the most precisely weighted dumbbells, the sneaker engineered for efficiency — these are now objects of quiet pride as much as athletic tools.',
      'A non-slip TPE mat with alignment lines is not just a training surface; it is a prompt. Unroll it, and your body knows what comes next. The ritual of physical practice begins before the first pose.',
      'Adjustable dumbbells represent the clearest argument for quality over quantity in home fitness. A single pair replacing fifteen sets is the domestic equivalent of capsule dressing — everything you need, nothing you do not.',
      'The smart water bottle has earned its category. Hydration reminders built into the design, vacuum insulation that keeps water cold for twelve hours — these are not gimmicks. They are friction-removal devices for better habits.',
      'Dress the practice as you would dress for anything important. Quality materials, considered design, clothes that move with you rather than against you. The body responds to being taken seriously.',
    ],
  },
  {
    id: 'a5',
    slug: 'tech-for-you',
    tag: 'Electronics',
    title: 'Technology That Works for You',
    excerpt: 'Devices that disappear into your life rather than dominate it.',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1200&q=80',
    date: 'February 26, 2026',
    body: [
      'The best technology is invisible. Not in the literal sense, but in its integration — devices that solve problems so elegantly you stop noticing them as devices at all.',
      'A smartwatch done well is not a screen on your wrist competing for attention. It is a health monitor that surfaces information when you need it and retreats when you do not. GPS, heart rate, seven-day battery — the specification is almost incidental to the experience.',
      'Active noise cancellation in earbuds has moved from luxury to necessity for anyone who works in shared spaces. Thirty-two hours of battery across earbuds and case means a full work week before charging. The music is irrelevant; the focus it enables is the product.',
      'Mechanical keyboards occupy an interesting position between tool and object. The tactile feedback, the customisable layout, the wireless freedom — these are functional advantages. But there is also genuine pleasure in the click and resistance of a well-made switch.',
      'The 65W USB-C power bank is quietly one of the most important travel companions available. Charge a laptop, a phone, and earbuds simultaneously. One cable, one device, complete freedom from the anxiety of a dying battery.',
    ],
  },
  {
    id: 'a6',
    slug: 'morning-rituals',
    tag: 'Lifestyle',
    title: 'Morning Rituals Worth Keeping',
    excerpt: 'The objects and practices that make the first hour count.',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80',
    date: 'February 18, 2026',
    body: [
      'How you spend the first hour of the day shapes the hours that follow. Not through productivity maximisation or rigid routine, but through the quiet accumulation of small, nourishing choices.',
      'The pour-over method transforms coffee from a caffeine delivery mechanism into a practice. The thirty seconds of bloom, the slow pour, the attention required — this is not inefficiency. It is presence before the day accelerates.',
      'An aromatherapy diffuser in the bedroom or workspace creates an olfactory anchor. Certain scents reliably signal to the nervous system: wake, focus, wind down. The ritual of filling it, choosing a blend, becomes its own small ceremony.',
      'Movement before screens is the single highest-leverage morning choice. Unroll the mat, take ten minutes or forty — the duration matters less than the consistency. The body, given space to breathe before the inbox opens, thinks more clearly all day.',
      'A generous breakfast from beautiful ceramics on a well-considered surface: this is the morning ritual worth protecting. Not because it looks good on a screen, but because it feels good in your actual life. That distinction is everything.',
    ],
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}
