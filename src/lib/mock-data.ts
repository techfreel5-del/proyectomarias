// ─── Types ───────────────────────────────────────────────────

export type Category = 'fashion' | 'home-kitchen' | 'sports-fitness' | 'electronics';
export type ProductBadge = 'new' | 'trending' | 'sale';

export interface ColorOption {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  subcategory: string;
  price: number;
  originalPrice?: number;
  images: string[];
  colors: ColorOption[];
  sizes: string[];
  description: string;
  badge?: ProductBadge;
  inStock: boolean;
}

export interface TrackingEvent {
  id: string;
  phase: 'received' | 'processing' | 'in-transit' | 'out-for-delivery' | 'delivered';
  label: string;
  sublabel: string;
  timestamp: string;
  location: string;
  photoUrl?: string;
  completed: boolean;
  active: boolean;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  product: string;
  qty: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'returned';
  date: string;
  total: number;
}

export interface DeliveryZone {
  id: string;
  name: string;
  estimatedHours: number;
  active: boolean;
  repartidores: number;
}

export interface POSProduct {
  id: string;
  name: string;
  sku: string;
  image: string;
  stock: number;
  allocatedZamora: number;
  category: string;
}

// ─── Products ─────────────────────────────────────────────────

export const products: Product[] = [
  // FASHION
  {
    id: 'f001',
    slug: 'linen-blend-jacket',
    name: 'Linen-blend Jacket',
    category: 'fashion',
    subcategory: 'Jackets',
    price: 119.00,
    originalPrice: 149.00,
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80',
      'https://images.unsplash.com/photo-1604644401890-0bd678c83788?w=600&q=80',
    ],
    colors: [{ name: 'Sand', hex: '#C8B89A' }, { name: 'Black', hex: '#1A1A1A' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Relaxed linen-blend jacket with a modern fit. Perfect for layering.',
    badge: 'sale',
    inStock: true,
  },
  {
    id: 'f002',
    slug: 'cashmere-blend-sweater',
    name: 'Cashmere-blend Sweater',
    category: 'fashion',
    subcategory: 'Knitwear',
    price: 125.00,
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80',
      'https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=600&q=80',
    ],
    colors: [{ name: 'Camel', hex: '#C19A6B' }, { name: 'Ivory', hex: '#FFFFF0' }, { name: 'Navy', hex: '#1B2A4A' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Ultra-soft cashmere-blend crewneck sweater with a relaxed silhouette.',
    badge: 'trending',
    inStock: true,
  },
  {
    id: 'f003',
    slug: 'midi-dress-black',
    name: 'Minimal Midi Dress',
    category: 'fashion',
    subcategory: 'Dresses',
    price: 89.00,
    images: [
      'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=600&q=80',
    ],
    colors: [{ name: 'Black', hex: '#1A1A1A' }, { name: 'Ecru', hex: '#EAE0C8' }],
    sizes: ['XS', 'S', 'M', 'L'],
    description: 'Clean lines, fluid fabric. A wardrobe essential.',
    inStock: true,
  },
  {
    id: 'f004',
    slug: 'leather-ankle-boots',
    name: 'Premium Leather Boots',
    category: 'fashion',
    subcategory: 'Footwear',
    price: 195.00,
    images: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80',
    ],
    colors: [{ name: 'Tan', hex: '#A0785A' }, { name: 'Black', hex: '#1A1A1A' }],
    sizes: ['36', '37', '38', '39', '40', '41'],
    description: 'Full-grain leather ankle boots with block heel. Timeless design.',
    badge: 'new',
    inStock: true,
  },
  {
    id: 'f005',
    slug: 'structured-tote-bag',
    name: 'Structured Tote Bag',
    category: 'fashion',
    subcategory: 'Accessories',
    price: 145.00,
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
    ],
    colors: [{ name: 'Cognac', hex: '#9A4722' }, { name: 'Black', hex: '#1A1A1A' }],
    sizes: ['One Size'],
    description: 'Minimal structured tote in premium leather. Fits a 13" laptop.',
    inStock: true,
  },
  {
    id: 'f006',
    slug: 'slim-chino-trousers',
    name: 'Slim Chino Trousers',
    category: 'fashion',
    subcategory: 'Bottoms',
    price: 79.00,
    images: [
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80',
    ],
    colors: [{ name: 'Khaki', hex: '#C3B091' }, { name: 'Navy', hex: '#1B2A4A' }, { name: 'Black', hex: '#1A1A1A' }],
    sizes: ['28', '30', '32', '34', '36'],
    description: 'Tailored slim-fit chinos in stretch cotton. Wear up or down.',
    inStock: true,
  },
  {
    id: 'f007',
    slug: 'minimalist-watch',
    name: 'Minimalist Watch',
    category: 'fashion',
    subcategory: 'Accessories',
    price: 220.00,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    ],
    colors: [{ name: 'Silver', hex: '#C0C0C0' }, { name: 'Gold', hex: '#FFD700' }],
    sizes: ['One Size'],
    description: 'Ultra-thin minimalist watch with sapphire crystal glass.',
    badge: 'new',
    inStock: true,
  },
  {
    id: 'f008',
    slug: 'classic-belt',
    name: 'Classic Leather Belt',
    category: 'fashion',
    subcategory: 'Accessories',
    price: 55.00,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    ],
    colors: [{ name: 'Black', hex: '#1A1A1A' }, { name: 'Tan', hex: '#A0785A' }],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Full-grain leather belt with brushed silver buckle.',
    inStock: true,
  },

  // HOME & KITCHEN
  {
    id: 'h001',
    slug: 'pro-blender-1200w',
    name: 'Pro Blender 1200W',
    category: 'home-kitchen',
    subcategory: 'Appliances',
    price: 189.00,
    originalPrice: 230.00,
    images: [
      'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&q=80',
    ],
    colors: [{ name: 'Silver', hex: '#C0C0C0' }, { name: 'Black', hex: '#1A1A1A' }],
    sizes: ['1.5L', '2L'],
    description: 'High-performance blender with 8-blade system. Silent motor technology.',
    badge: 'sale',
    inStock: true,
  },
  {
    id: 'h002',
    slug: 'pour-over-coffee-maker',
    name: 'Pour-over Coffee Maker',
    category: 'home-kitchen',
    subcategory: 'Coffee',
    price: 75.00,
    images: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
    ],
    colors: [{ name: 'Clear', hex: '#F5F5F5' }, { name: 'Black', hex: '#1A1A1A' }],
    sizes: ['4-cup', '8-cup'],
    description: 'Borosilicate glass pour-over with walnut collar. Brews the perfect cup.',
    inStock: true,
  },
  {
    id: 'h003',
    slug: 'multi-cooker-6qt',
    name: 'Multi-Cooker 6Qt',
    category: 'home-kitchen',
    subcategory: 'Appliances',
    price: 149.00,
    images: [
      'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80',
    ],
    colors: [{ name: 'Silver', hex: '#C0C0C0' }],
    sizes: ['6Qt'],
    description: '15-in-1 electric pressure cooker. Slow cook, sauté, steam, and more.',
    badge: 'trending',
    inStock: true,
  },
  {
    id: 'h004',
    slug: 'linen-throw-blanket',
    name: 'Linen Throw Blanket',
    category: 'home-kitchen',
    subcategory: 'Textiles',
    price: 95.00,
    images: [
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80',
    ],
    colors: [{ name: 'Oatmeal', hex: '#D4C5A9' }, { name: 'Sage', hex: '#8FA689' }],
    sizes: ['130×170cm'],
    description: 'Stonewashed linen throw. Gets softer with every wash.',
    inStock: true,
  },
  {
    id: 'h005',
    slug: 'ceramic-dinnerware-set',
    name: 'Ceramic Dinnerware Set',
    category: 'home-kitchen',
    subcategory: 'Tableware',
    price: 120.00,
    images: [
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80',
    ],
    colors: [{ name: 'White', hex: '#FAFAFA' }, { name: 'Speckled', hex: '#D5CFC8' }],
    sizes: ['4-piece', '8-piece'],
    description: 'Handcrafted ceramic dinnerware set. Microwave and dishwasher safe.',
    badge: 'new',
    inStock: true,
  },
  {
    id: 'h006',
    slug: 'oak-cutting-board',
    name: 'Oak Cutting Board',
    category: 'home-kitchen',
    subcategory: 'Accessories',
    price: 65.00,
    images: [
      'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=600&q=80',
    ],
    colors: [{ name: 'Natural', hex: '#C8A97A' }],
    sizes: ['M', 'L', 'XL'],
    description: 'End-grain oak cutting board with juice groove. Pre-oiled and ready to use.',
    inStock: true,
  },
  {
    id: 'h007',
    slug: 'aromatherapy-diffuser',
    name: 'Aromatherapy Diffuser',
    category: 'home-kitchen',
    subcategory: 'Wellness',
    price: 55.00,
    images: [
      'https://images.unsplash.com/photo-1601598851547-4302969d0614?w=600&q=80',
    ],
    colors: [{ name: 'White', hex: '#FAFAFA' }, { name: 'Wood', hex: '#A0785A' }],
    sizes: ['300ml'],
    description: 'Ultrasonic essential oil diffuser with 7-color LED and timer.',
    inStock: true,
  },
  {
    id: 'h008',
    slug: 'waffle-bath-towels',
    name: 'Waffle Bath Towels',
    category: 'home-kitchen',
    subcategory: 'Textiles',
    price: 45.00,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    ],
    colors: [{ name: 'White', hex: '#FAFAFA' }, { name: 'Sage', hex: '#8FA689' }, { name: 'Blush', hex: '#E8C5BE' }],
    sizes: ['Set of 2', 'Set of 4'],
    description: 'Premium waffle-weave towels. 100% Turkish cotton. Quick-dry.',
    inStock: true,
  },

  // SPORTS & FITNESS
  {
    id: 's001',
    slug: 'yoga-mat-6mm',
    name: 'Yoga Mat 6mm',
    category: 'sports-fitness',
    subcategory: 'Yoga',
    price: 68.00,
    images: [
      'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&q=80',
    ],
    colors: [{ name: 'Slate Gray', hex: '#708090' }, { name: 'Sage', hex: '#8FA689' }, { name: 'Black', hex: '#1A1A1A' }],
    sizes: ['Standard', 'Extra Long'],
    description: 'Non-slip TPE yoga mat with alignment lines. Eco-friendly and sweat-resistant.',
    badge: 'trending',
    inStock: true,
  },
  {
    id: 's002',
    slug: 'adjustable-dumbbells',
    name: 'Adjustable Dumbbells',
    category: 'sports-fitness',
    subcategory: 'Weights',
    price: 249.00,
    originalPrice: 299.00,
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
    ],
    colors: [{ name: 'Black/Chrome', hex: '#2A2A2A' }],
    sizes: ['5–25kg', '5–50kg'],
    description: 'Space-saving adjustable dumbbells. Replace 15 pairs. Dial select system.',
    badge: 'sale',
    inStock: true,
  },
  {
    id: 's003',
    slug: 'resistance-bands-set',
    name: 'Resistance Bands Set',
    category: 'sports-fitness',
    subcategory: 'Accessories',
    price: 35.00,
    images: [
      'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600&q=80',
    ],
    colors: [{ name: 'Multi', hex: '#00C9B1' }],
    sizes: ['5-pack'],
    description: '5 resistance levels. 100% natural latex. Includes carry bag and guide.',
    inStock: true,
  },
  {
    id: 's004',
    slug: 'smart-water-bottle',
    name: 'Smart Water Bottle',
    category: 'sports-fitness',
    subcategory: 'Accessories',
    price: 49.00,
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80',
    ],
    colors: [{ name: 'Teal', hex: '#00C9B1' }, { name: 'Black', hex: '#1A1A1A' }, { name: 'White', hex: '#FAFAFA' }],
    sizes: ['500ml', '750ml'],
    description: 'Insulated stainless steel bottle with hydration reminder LED ring.',
    badge: 'new',
    inStock: true,
  },
  {
    id: 's005',
    slug: 'running-shoes-x2',
    name: 'Runner X2 Sneakers',
    category: 'sports-fitness',
    subcategory: 'Footwear',
    price: 135.00,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    ],
    colors: [{ name: 'White', hex: '#FAFAFA' }, { name: 'Black', hex: '#1A1A1A' }],
    sizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
    description: 'Lightweight mesh runners with responsive cushioning sole.',
    inStock: true,
  },
  {
    id: 's006',
    slug: 'foam-roller-deep-tissue',
    name: 'Deep Tissue Foam Roller',
    category: 'sports-fitness',
    subcategory: 'Recovery',
    price: 42.00,
    images: [
      'https://images.unsplash.com/photo-1616279969856-759f316a5ac1?w=600&q=80',
    ],
    colors: [{ name: 'Black', hex: '#1A1A1A' }, { name: 'Blue', hex: '#4A90D9' }],
    sizes: ['30cm', '45cm', '60cm'],
    description: 'High-density EVA foam roller with grid pattern for deep tissue massage.',
    inStock: true,
  },
  {
    id: 's007',
    slug: 'gym-bag-xl',
    name: 'Performance Gym Bag',
    category: 'sports-fitness',
    subcategory: 'Bags',
    price: 89.00,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    ],
    colors: [{ name: 'Black', hex: '#1A1A1A' }, { name: 'Gray', hex: '#6B6359' }],
    sizes: ['40L'],
    description: 'Waterproof duffel with separate shoe compartment and wet pocket.',
    inStock: true,
  },

  // ELECTRONICS
  {
    id: 'e001',
    slug: 'smartwatch-pro',
    name: 'SmartWatch Pro',
    category: 'electronics',
    subcategory: 'Wearables',
    price: 289.00,
    originalPrice: 349.00,
    images: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80',
    ],
    colors: [{ name: 'Black', hex: '#1A1A1A' }, { name: 'Silver', hex: '#C0C0C0' }],
    sizes: ['40mm', '44mm'],
    description: 'AMOLED display smartwatch with GPS, heart rate, and 7-day battery life.',
    badge: 'new',
    inStock: true,
  },
  {
    id: 'e002',
    slug: 'wireless-earbuds-pro',
    name: 'Wireless Earbuds Pro',
    category: 'electronics',
    subcategory: 'Audio',
    price: 149.00,
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80',
    ],
    colors: [{ name: 'White', hex: '#FAFAFA' }, { name: 'Black', hex: '#1A1A1A' }],
    sizes: ['One Size'],
    description: 'Active noise-cancelling earbuds. 32h total battery. IPX5 water-resistant.',
    badge: 'trending',
    inStock: true,
  },
  {
    id: 'e003',
    slug: 'portable-charger-20000',
    name: 'Power Bank 20000mAh',
    category: 'electronics',
    subcategory: 'Charging',
    price: 79.00,
    images: [
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&q=80',
    ],
    colors: [{ name: 'Black', hex: '#1A1A1A' }, { name: 'White', hex: '#FAFAFA' }],
    sizes: ['One Size'],
    description: '20,000mAh power bank with 65W USB-C PD. Charges laptops.',
    inStock: true,
  },
  {
    id: 'e004',
    slug: 'mechanical-keyboard',
    name: 'Compact Mechanical Keyboard',
    category: 'electronics',
    subcategory: 'Computing',
    price: 129.00,
    images: [
      'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600&q=80',
    ],
    colors: [{ name: 'Black', hex: '#1A1A1A' }, { name: 'White', hex: '#FAFAFA' }],
    sizes: ['75%', 'TKL'],
    description: '75% layout wireless mechanical keyboard with hot-swap switches.',
    badge: 'new',
    inStock: true,
  },
  {
    id: 'e005',
    slug: 'ultrawide-monitor',
    name: 'UltraWide Monitor 34"',
    category: 'electronics',
    subcategory: 'Displays',
    price: 499.00,
    originalPrice: 599.00,
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80',
    ],
    colors: [{ name: 'Black', hex: '#1A1A1A' }],
    sizes: ['34"'],
    description: '34" curved ultrawide IPS, 144Hz, 1ms, USB-C 65W charging.',
    badge: 'sale',
    inStock: true,
  },
  {
    id: 'e006',
    slug: 'action-camera-4k',
    name: 'Action Camera 4K',
    category: 'electronics',
    subcategory: 'Cameras',
    price: 199.00,
    images: [
      'https://images.unsplash.com/photo-1499864180-e3e24e6b8a61?w=600&q=80',
    ],
    colors: [{ name: 'Black', hex: '#1A1A1A' }],
    sizes: ['One Size'],
    description: '4K/60fps action camera. Waterproof to 10m. 2" touch screen.',
    inStock: true,
  },
  {
    id: 'e007',
    slug: 'portable-speaker-bt',
    name: 'Portable BT Speaker',
    category: 'electronics',
    subcategory: 'Audio',
    price: 89.00,
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80',
    ],
    colors: [{ name: 'Black', hex: '#1A1A1A' }, { name: 'Teal', hex: '#00C9B1' }, { name: 'Sand', hex: '#C8B89A' }],
    sizes: ['One Size'],
    description: '360° sound bluetooth speaker. IP67 waterproof. 24h playtime.',
    badge: 'trending',
    inStock: true,
  },
];

// ─── Tracking Events ───────────────────────────────────────────

export const trackingEvents: TrackingEvent[] = [
  {
    id: 'te1',
    phase: 'received',
    label: 'Order Received',
    sublabel: 'Order received & confirmed',
    timestamp: 'Apr 1, 2026 · 09:14',
    location: 'MARIASCLUB Warehouse, Zamora',
    photoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200&q=60',
    completed: true,
    active: false,
  },
  {
    id: 'te2',
    phase: 'processing',
    label: 'Processing',
    sublabel: 'Packed & assigned to transporter',
    timestamp: 'Apr 2, 2026 · 11:30',
    location: 'Zamora Distribution Hub',
    photoUrl: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=200&q=60',
    completed: true,
    active: false,
  },
  {
    id: 'te3',
    phase: 'in-transit',
    label: 'In Transit',
    sublabel: 'In transit — on route',
    timestamp: 'Apr 3, 2026 · 08:45',
    location: 'Zamora → Jacona route',
    completed: false,
    active: true,
  },
  {
    id: 'te4',
    phase: 'delivered',
    label: 'Delivered',
    sublabel: 'Out for delivery / Delivered',
    timestamp: '—',
    location: '—',
    completed: false,
    active: false,
  },
];

// ─── Orders ────────────────────────────────────────────────────

export const orders: Order[] = [
  { id: 'ORD-001', customerId: 'c1', customerName: 'María García', product: 'Cashmere-blend Sweater', qty: 1, status: 'delivered', date: '2026-03-28', total: 125.00 },
  { id: 'ORD-002', customerId: 'c2', customerName: 'Juan Pérez', product: 'Pro Blender 1200W', qty: 2, status: 'shipped', date: '2026-04-01', total: 378.00 },
  { id: 'ORD-003', customerId: 'c3', customerName: 'Ana Torres', product: 'Yoga Mat 6mm', qty: 1, status: 'processing', date: '2026-04-03', total: 68.00 },
  { id: 'ORD-004', customerId: 'c4', customerName: 'Carlos Rios', product: 'SmartWatch Pro', qty: 1, status: 'pending', date: '2026-04-04', total: 289.00 },
  { id: 'ORD-005', customerId: 'c5', customerName: 'Luisa Mora', product: 'Linen-blend Jacket', qty: 1, status: 'returned', date: '2026-03-25', total: 119.00 },
];

// ─── Delivery Zones ────────────────────────────────────────────

export const deliveryZones: DeliveryZone[] = [
  { id: 'z1', name: 'Zamora Centro', estimatedHours: 4, active: true, repartidores: 3 },
  { id: 'z2', name: 'Zamora Norte', estimatedHours: 6, active: true, repartidores: 2 },
  { id: 'z3', name: 'Zamora Sur', estimatedHours: 5, active: true, repartidores: 2 },
  { id: 'z4', name: 'Jacona', estimatedHours: 12, active: true, repartidores: 1 },
  { id: 'z5', name: 'Tangancícuaro', estimatedHours: 18, active: false, repartidores: 0 },
  { id: 'z6', name: 'Jiquilpan', estimatedHours: 24, active: true, repartidores: 1 },
];

// ─── POS Products (Supplier) ───────────────────────────────────

export const posProducts: POSProduct[] = [
  { id: 'p1', name: 'Licuadora Blender', sku: 'BL-500', image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=300&q=70', stock: 48, allocatedZamora: 20, category: 'Appliances' },
  { id: 'p2', name: 'Coffee Maker', sku: 'CM-200', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=70', stock: 32, allocatedZamora: 15, category: 'Coffee' },
  { id: 'p3', name: 'Buffer Blender', sku: 'BB-300', image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=300&q=70', stock: 25, allocatedZamora: 10, category: 'Appliances' },
  { id: 'p4', name: 'Yoga Mat', sku: 'YM-60', image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=300&q=70', stock: 65, allocatedZamora: 30, category: 'Sports' },
  { id: 'p5', name: 'Yoga Rug', sku: 'YR-80', image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=300&q=70', stock: 42, allocatedZamora: 18, category: 'Sports' },
  { id: 'p6', name: 'Dumbbell Set', sku: 'DB-25', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=70', stock: 18, allocatedZamora: 8, category: 'Sports' },
  { id: 'p7', name: 'SmartWatch', sku: 'SW-01', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&q=70', stock: 22, allocatedZamora: 10, category: 'Electronics' },
  { id: 'p8', name: 'Earbuds Pro', sku: 'EP-200', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&q=70', stock: 55, allocatedZamora: 25, category: 'Electronics' },
  { id: 'p9', name: 'Power Bank', sku: 'PB-20K', image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=300&q=70', stock: 38, allocatedZamora: 15, category: 'Electronics' },
  { id: 'p10', name: 'Linen Jacket', sku: 'LJ-M', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&q=70', stock: 28, allocatedZamora: 12, category: 'Fashion' },
  { id: 'p11', name: 'Cashmere Sweater', sku: 'CS-L', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&q=70', stock: 33, allocatedZamora: 14, category: 'Fashion' },
  { id: 'p12', name: 'Leather Tote', sku: 'LT-BK', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&q=70', stock: 20, allocatedZamora: 9, category: 'Fashion' },
];

// ─── Helper ────────────────────────────────────────────────────

export const getProductsByCategory = (cat: Category) =>
  products.filter((p) => p.category === cat);

export const getFeaturedProducts = () =>
  products.filter((p) => p.badge).slice(0, 6);

export const getProductBySlug = (slug: string) =>
  products.find((p) => p.slug === slug);

export const categoryLabels: Record<Category, string> = {
  'fashion': 'Fashion',
  'home-kitchen': 'Home & Kitchen',
  'sports-fitness': 'Sports & Fitness',
  'electronics': 'Electronics',
};
