import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // ─── Suppliers ────────────────────────────────────────────────
  const supplierFashion = await prisma.supplier.upsert({
    where: { id: "fashion-hogar-zamora" },
    update: {},
    create: {
      id: "fashion-hogar-zamora",
      email: "proveedor@mariasclub.com",
      displayName: "Moda & Hogar Zamora",
      active: true,
      profile: {
        create: {
          storeName: "Moda & Hogar Zamora",
          slug: "moda-hogar-zamora",
          brandColor: "#1E3A5F",
          accentColor: "#E8A020",
          description: "Moda y artículos para el hogar de calidad en Zamora.",
          whatsappNumber: "3531234567",
          wholesaleRate: 70,
          shippingMethods: [
            { type: "pickup", label: "Recoger en tienda", cost: 0, active: true },
          ],
          bankInfo: {
            bank: "BBVA",
            clabe: "012345678901234567",
            account: "1234567890",
            beneficiary: "Moda y Hogar Zamora SA de CV",
          },
        },
      },
    },
  });

  const supplierDeportes = await prisma.supplier.upsert({
    where: { id: "deportes-tech-zamora" },
    update: {},
    create: {
      id: "deportes-tech-zamora",
      email: "proveedor2@mariasclub.com",
      displayName: "Deportes & Tech Zamora",
      active: true,
      profile: {
        create: {
          storeName: "Deportes & Tech Zamora",
          slug: "deportes-tech-zamora",
          brandColor: "#0A3D2E",
          accentColor: "#00C9B1",
          description: "Equipamiento deportivo y tecnología en Zamora.",
          whatsappNumber: "3539876543",
          wholesaleRate: 70,
          shippingMethods: [
            { type: "pickup", label: "Recoger en tienda", cost: 0, active: true },
          ],
          bankInfo: {
            bank: "Banorte",
            clabe: "072345678901234567",
            account: "0987654321",
            beneficiary: "Deportes y Tech Zamora SA de CV",
          },
        },
      },
    },
  });

  console.log("Suppliers created:", supplierFashion.id, supplierDeportes.id);

  // ─── Users ────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("mariasclub2026", 12);

  await prisma.user.upsert({
    where: { email: "admin@mariasclub.com" },
    update: {},
    create: {
      email: "admin@mariasclub.com",
      password: passwordHash,
      name: "Admin MARIASCLUB",
      role: "admin",
    },
  });

  await prisma.user.upsert({
    where: { email: "transportista@mariasclub.com" },
    update: {},
    create: {
      email: "transportista@mariasclub.com",
      password: passwordHash,
      name: "Transportista Principal",
      role: "transportista",
    },
  });

  await prisma.user.upsert({
    where: { email: "repartidor@mariasclub.com" },
    update: {},
    create: {
      email: "repartidor@mariasclub.com",
      password: passwordHash,
      name: "Repartidor Local",
      role: "repartidor",
    },
  });

  await prisma.user.upsert({
    where: { email: "proveedor@mariasclub.com" },
    update: {},
    create: {
      email: "proveedor@mariasclub.com",
      password: passwordHash,
      name: "Moda & Hogar Zamora",
      role: "proveedor",
      supplierId: "fashion-hogar-zamora",
    },
  });

  await prisma.user.upsert({
    where: { email: "proveedor2@mariasclub.com" },
    update: {},
    create: {
      email: "proveedor2@mariasclub.com",
      password: passwordHash,
      name: "Deportes & Tech Zamora",
      role: "proveedor",
      supplierId: "deportes-tech-zamora",
    },
  });

  await prisma.user.upsert({
    where: { email: "cliente@mariasclub.com" },
    update: {},
    create: {
      email: "cliente@mariasclub.com",
      password: passwordHash,
      name: "Cliente Ejemplo",
      role: "cliente",
    },
  });

  console.log("Users created");

  // ─── Products ────────────────────────────────────────────────
  const productsData = [
    // FASHION
    { id: "f001", slug: "linen-blend-jacket", name: "Linen-blend Jacket", category: "fashion", subcategory: "Jackets", price: 119.0, originalPrice: 149.0, images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80", "https://images.unsplash.com/photo-1604644401890-0bd678c83788?w=600&q=80"], colors: [{ name: "Sand", hex: "#C8B89A" }, { name: "Black", hex: "#1A1A1A" }], sizes: ["XS", "S", "M", "L", "XL"], description: "Relaxed linen-blend jacket with a modern fit. Perfect for layering.", badge: "sale", inStock: true, supplierId: "fashion-hogar-zamora" },
    { id: "f002", slug: "cashmere-blend-sweater", name: "Cashmere-blend Sweater", category: "fashion", subcategory: "Knitwear", price: 125.0, images: ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80", "https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=600&q=80"], colors: [{ name: "Camel", hex: "#C19A6B" }, { name: "Ivory", hex: "#FFFFF0" }, { name: "Navy", hex: "#1B2A4A" }], sizes: ["XS", "S", "M", "L", "XL"], description: "Ultra-soft cashmere-blend crewneck sweater with a relaxed silhouette.", badge: "trending", inStock: true, supplierId: "fashion-hogar-zamora" },
    { id: "f003", slug: "midi-dress-black", name: "Minimal Midi Dress", category: "fashion", subcategory: "Dresses", price: 89.0, images: ["https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=600&q=80"], colors: [{ name: "Black", hex: "#1A1A1A" }, { name: "Ecru", hex: "#EAE0C8" }], sizes: ["XS", "S", "M", "L"], description: "Clean lines, fluid fabric. A wardrobe essential.", inStock: true, supplierId: "fashion-hogar-zamora" },
    { id: "f004", slug: "leather-ankle-boots", name: "Premium Leather Boots", category: "fashion", subcategory: "Footwear", price: 195.0, images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80"], colors: [{ name: "Tan", hex: "#A0785A" }, { name: "Black", hex: "#1A1A1A" }], sizes: ["36", "37", "38", "39", "40", "41"], description: "Full-grain leather ankle boots with block heel. Timeless design.", badge: "new", inStock: true, supplierId: "fashion-hogar-zamora" },
    { id: "f005", slug: "structured-tote-bag", name: "Structured Tote Bag", category: "fashion", subcategory: "Accessories", price: 145.0, images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80"], colors: [{ name: "Cognac", hex: "#9A4722" }, { name: "Black", hex: "#1A1A1A" }], sizes: ["One Size"], description: "Minimal structured tote in premium leather. Fits a 13\" laptop.", inStock: true, supplierId: "fashion-hogar-zamora" },
    { id: "f006", slug: "slim-chino-trousers", name: "Slim Chino Trousers", category: "fashion", subcategory: "Bottoms", price: 79.0, images: ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80"], colors: [{ name: "Khaki", hex: "#C3B091" }, { name: "Navy", hex: "#1B2A4A" }, { name: "Black", hex: "#1A1A1A" }], sizes: ["28", "30", "32", "34", "36"], description: "Tailored slim-fit chinos in stretch cotton. Wear up or down.", inStock: true, supplierId: "fashion-hogar-zamora" },
    { id: "f007", slug: "minimalist-watch", name: "Minimalist Watch", category: "fashion", subcategory: "Accessories", price: 220.0, images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"], colors: [{ name: "Silver", hex: "#C0C0C0" }, { name: "Gold", hex: "#FFD700" }], sizes: ["One Size"], description: "Ultra-thin minimalist watch with sapphire crystal glass.", badge: "new", inStock: true, supplierId: "fashion-hogar-zamora" },
    { id: "f008", slug: "classic-belt", name: "Classic Leather Belt", category: "fashion", subcategory: "Accessories", price: 55.0, images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80"], colors: [{ name: "Black", hex: "#1A1A1A" }, { name: "Tan", hex: "#A0785A" }], sizes: ["S", "M", "L", "XL"], description: "Full-grain leather belt with brushed silver buckle.", inStock: true, supplierId: "fashion-hogar-zamora" },
    // HOME & KITCHEN
    { id: "h001", slug: "pro-blender-1200w", name: "Pro Blender 1200W", category: "home-kitchen", subcategory: "Appliances", price: 189.0, originalPrice: 230.0, images: ["https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&q=80"], colors: [{ name: "Silver", hex: "#C0C0C0" }, { name: "Black", hex: "#1A1A1A" }], sizes: ["1.5L", "2L"], description: "High-performance blender with 8-blade system. Silent motor technology.", badge: "sale", inStock: true, supplierId: "fashion-hogar-zamora" },
    { id: "h002", slug: "pour-over-coffee-maker", name: "Pour-over Coffee Maker", category: "home-kitchen", subcategory: "Coffee", price: 75.0, images: ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80"], colors: [{ name: "Clear", hex: "#F5F5F5" }, { name: "Black", hex: "#1A1A1A" }], sizes: ["4-cup", "8-cup"], description: "Borosilicate glass pour-over with walnut collar. Brews the perfect cup.", inStock: true, supplierId: "fashion-hogar-zamora" },
    { id: "h003", slug: "multi-cooker-6qt", name: "Multi-Cooker 6Qt", category: "home-kitchen", subcategory: "Appliances", price: 149.0, images: ["https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80"], colors: [{ name: "Silver", hex: "#C0C0C0" }], sizes: ["6Qt"], description: "15-in-1 electric pressure cooker. Slow cook, sauté, steam, and more.", badge: "trending", inStock: true, supplierId: "fashion-hogar-zamora" },
    { id: "h004", slug: "linen-throw-blanket", name: "Linen Throw Blanket", category: "home-kitchen", subcategory: "Textiles", price: 95.0, images: ["https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80"], colors: [{ name: "Oatmeal", hex: "#D4C5A9" }, { name: "Sage", hex: "#8FA689" }], sizes: ["130×170cm"], description: "Stonewashed linen throw. Gets softer with every wash.", inStock: true, supplierId: "fashion-hogar-zamora" },
    { id: "h005", slug: "ceramic-dinnerware-set", name: "Ceramic Dinnerware Set", category: "home-kitchen", subcategory: "Tableware", price: 120.0, images: ["https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80"], colors: [{ name: "White", hex: "#FAFAFA" }, { name: "Speckled", hex: "#D5CFC8" }], sizes: ["4-piece", "8-piece"], description: "Handcrafted ceramic dinnerware set. Microwave and dishwasher safe.", badge: "new", inStock: true, supplierId: "fashion-hogar-zamora" },
    { id: "h006", slug: "oak-cutting-board", name: "Oak Cutting Board", category: "home-kitchen", subcategory: "Accessories", price: 65.0, images: ["https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=600&q=80"], colors: [{ name: "Natural", hex: "#C8A97A" }], sizes: ["M", "L", "XL"], description: "End-grain oak cutting board with juice groove. Pre-oiled and ready to use.", inStock: true, supplierId: "fashion-hogar-zamora" },
    { id: "h007", slug: "aromatherapy-diffuser", name: "Aromatherapy Diffuser", category: "home-kitchen", subcategory: "Wellness", price: 55.0, images: ["https://images.unsplash.com/photo-1601598851547-4302969d0614?w=600&q=80"], colors: [{ name: "White", hex: "#FAFAFA" }, { name: "Wood", hex: "#A0785A" }], sizes: ["300ml"], description: "Ultrasonic essential oil diffuser with 7-color LED and timer.", inStock: true, supplierId: "fashion-hogar-zamora" },
    { id: "h008", slug: "waffle-bath-towels", name: "Waffle Bath Towels", category: "home-kitchen", subcategory: "Textiles", price: 45.0, images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80"], colors: [{ name: "White", hex: "#FAFAFA" }, { name: "Sage", hex: "#8FA689" }, { name: "Blush", hex: "#E8C5BE" }], sizes: ["Set of 2", "Set of 4"], description: "Premium waffle-weave towels. 100% Turkish cotton. Quick-dry.", inStock: true, supplierId: "fashion-hogar-zamora" },
    // SPORTS & FITNESS
    { id: "s001", slug: "yoga-mat-6mm", name: "Yoga Mat 6mm", category: "sports-fitness", subcategory: "Yoga", price: 68.0, images: ["https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&q=80"], colors: [{ name: "Slate Gray", hex: "#708090" }, { name: "Sage", hex: "#8FA689" }, { name: "Black", hex: "#1A1A1A" }], sizes: ["Standard", "Extra Long"], description: "Non-slip TPE yoga mat with alignment lines. Eco-friendly and sweat-resistant.", badge: "trending", inStock: true, supplierId: "deportes-tech-zamora" },
    { id: "s002", slug: "adjustable-dumbbells", name: "Adjustable Dumbbells", category: "sports-fitness", subcategory: "Weights", price: 249.0, originalPrice: 299.0, images: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80"], colors: [{ name: "Black/Chrome", hex: "#2A2A2A" }], sizes: ["5–25kg", "5–50kg"], description: "Space-saving adjustable dumbbells. Replace 15 pairs. Dial select system.", badge: "sale", inStock: true, supplierId: "deportes-tech-zamora" },
    { id: "s003", slug: "resistance-bands-set", name: "Resistance Bands Set", category: "sports-fitness", subcategory: "Accessories", price: 35.0, images: ["https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600&q=80"], colors: [{ name: "Multi", hex: "#00C9B1" }], sizes: ["5-pack"], description: "5 resistance levels. 100% natural latex. Includes carry bag and guide.", inStock: true, supplierId: "deportes-tech-zamora" },
    { id: "s004", slug: "smart-water-bottle", name: "Smart Water Bottle", category: "sports-fitness", subcategory: "Accessories", price: 49.0, images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80"], colors: [{ name: "Teal", hex: "#00C9B1" }, { name: "Black", hex: "#1A1A1A" }, { name: "White", hex: "#FAFAFA" }], sizes: ["500ml", "750ml"], description: "Insulated stainless steel bottle with hydration reminder LED ring.", badge: "new", inStock: true, supplierId: "deportes-tech-zamora" },
    { id: "s005", slug: "running-shoes-x2", name: "Runner X2 Sneakers", category: "sports-fitness", subcategory: "Footwear", price: 135.0, images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80"], colors: [{ name: "White", hex: "#FAFAFA" }, { name: "Black", hex: "#1A1A1A" }], sizes: ["38", "39", "40", "41", "42", "43", "44", "45"], description: "Lightweight mesh runners with responsive cushioning sole.", inStock: true, supplierId: "deportes-tech-zamora" },
    { id: "s006", slug: "foam-roller-deep-tissue", name: "Deep Tissue Foam Roller", category: "sports-fitness", subcategory: "Recovery", price: 42.0, images: ["https://images.unsplash.com/photo-1616279969856-759f316a5ac1?w=600&q=80"], colors: [{ name: "Black", hex: "#1A1A1A" }, { name: "Blue", hex: "#4A90D9" }], sizes: ["30cm", "45cm", "60cm"], description: "High-density EVA foam roller with grid pattern for deep tissue massage.", inStock: true, supplierId: "deportes-tech-zamora" },
    { id: "s007", slug: "gym-bag-xl", name: "Performance Gym Bag", category: "sports-fitness", subcategory: "Bags", price: 89.0, images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80"], colors: [{ name: "Black", hex: "#1A1A1A" }, { name: "Gray", hex: "#6B6359" }], sizes: ["40L"], description: "Waterproof duffel with separate shoe compartment and wet pocket.", inStock: true, supplierId: "deportes-tech-zamora" },
    // ELECTRONICS
    { id: "e001", slug: "smartwatch-pro", name: "SmartWatch Pro", category: "electronics", subcategory: "Wearables", price: 289.0, originalPrice: 349.0, images: ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80"], colors: [{ name: "Black", hex: "#1A1A1A" }, { name: "Silver", hex: "#C0C0C0" }], sizes: ["40mm", "44mm"], description: "AMOLED display smartwatch with GPS, heart rate, and 7-day battery life.", badge: "new", inStock: true, supplierId: "deportes-tech-zamora" },
    { id: "e002", slug: "wireless-earbuds-pro", name: "Wireless Earbuds Pro", category: "electronics", subcategory: "Audio", price: 149.0, images: ["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80"], colors: [{ name: "White", hex: "#FAFAFA" }, { name: "Black", hex: "#1A1A1A" }], sizes: ["One Size"], description: "Active noise-cancelling earbuds. 32h total battery. IPX5 water-resistant.", badge: "trending", inStock: true, supplierId: "deportes-tech-zamora" },
    { id: "e003", slug: "portable-charger-20000", name: "Power Bank 20000mAh", category: "electronics", subcategory: "Charging", price: 79.0, images: ["https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&q=80"], colors: [{ name: "Black", hex: "#1A1A1A" }, { name: "White", hex: "#FAFAFA" }], sizes: ["One Size"], description: "20,000mAh power bank with 65W USB-C PD. Charges laptops.", inStock: true, supplierId: "deportes-tech-zamora" },
    { id: "e004", slug: "mechanical-keyboard", name: "Compact Mechanical Keyboard", category: "electronics", subcategory: "Computing", price: 129.0, images: ["https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600&q=80"], colors: [{ name: "Black", hex: "#1A1A1A" }, { name: "White", hex: "#FAFAFA" }], sizes: ["75%", "TKL"], description: "75% layout wireless mechanical keyboard with hot-swap switches.", badge: "new", inStock: true, supplierId: "deportes-tech-zamora" },
    { id: "e005", slug: "ultrawide-monitor", name: "UltraWide Monitor 34\"", category: "electronics", subcategory: "Displays", price: 499.0, originalPrice: 599.0, images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80"], colors: [{ name: "Black", hex: "#1A1A1A" }], sizes: ["34\""], description: "34\" curved ultrawide IPS, 144Hz, 1ms, USB-C 65W charging.", badge: "sale", inStock: true, supplierId: "deportes-tech-zamora" },
    { id: "e006", slug: "action-camera-4k", name: "Action Camera 4K", category: "electronics", subcategory: "Cameras", price: 199.0, images: ["https://images.unsplash.com/photo-1499864180-e3e24e6b8a61?w=600&q=80"], colors: [{ name: "Black", hex: "#1A1A1A" }], sizes: ["One Size"], description: "4K/60fps action camera. Waterproof to 10m. 2\" touch screen.", inStock: true, supplierId: "deportes-tech-zamora" },
    { id: "e007", slug: "portable-speaker-bt", name: "Portable BT Speaker", category: "electronics", subcategory: "Audio", price: 89.0, images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80"], colors: [{ name: "Black", hex: "#1A1A1A" }, { name: "Teal", hex: "#00C9B1" }, { name: "Sand", hex: "#C8B89A" }], sizes: ["One Size"], description: "360° sound bluetooth speaker. IP67 waterproof. 24h playtime.", badge: "trending", inStock: true, supplierId: "deportes-tech-zamora" },
  ];

  for (const p of productsData) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category,
        subcategory: p.subcategory,
        price: p.price,
        originalPrice: p.originalPrice ?? null,
        images: p.images,
        colors: p.colors,
        sizes: p.sizes,
        description: p.description,
        badge: p.badge ?? null,
        inStock: p.inStock,
        stock: 50,
        supplierId: p.supplierId,
      },
    });
  }

  console.log("Products created:", productsData.length);

  // ─── Delivery Zones ───────────────────────────────────────────
  const zones = [
    { id: "z1", name: "Zamora Centro", estimatedHours: 4, active: true, repartidores: 3 },
    { id: "z2", name: "Zamora Norte", estimatedHours: 6, active: true, repartidores: 2 },
    { id: "z3", name: "Zamora Sur", estimatedHours: 5, active: true, repartidores: 2 },
    { id: "z4", name: "Jacona", estimatedHours: 12, active: true, repartidores: 1 },
    { id: "z5", name: "Tangancícuaro", estimatedHours: 18, active: false, repartidores: 0 },
    { id: "z6", name: "Jiquilpan", estimatedHours: 24, active: true, repartidores: 1 },
  ];

  for (const z of zones) {
    await prisma.deliveryZone.upsert({
      where: { id: z.id },
      update: {},
      create: z,
    });
  }

  console.log("Delivery zones created");

  // ─── Store Config ────────────────────────────────────────────
  await prisma.storeConfig.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      whatsappNumber: "3531234567",
      shippingMethods: [
        { type: "pickup", label: "Recoger en tienda (gratis)", cost: 0, active: true },
        { type: "paqueteria", label: "Paquetería local", cost: 80, active: true },
        { type: "rappi", label: "Rappi Express", cost: 120, active: true },
      ],
      bankInfo: {
        bank: "BBVA",
        clabe: "012345678901234567",
        account: "1234567890",
        beneficiary: "MARIASCLUB SA de CV",
      },
      paymentMethods: ["transfer", "cash", "card"],
    },
  });

  console.log("Store config created");

  // ─── Orders ──────────────────────────────────────────────────
  const ordersData = [
    { id: "ORD-001", customerName: "María García", customerPhone: "3531111111", customerAddress: "Av. Morelos 123, Zamora Centro", customerZone: "z1", total: 125.0, paymentMethod: "transfer", status: "delivered" as const, productId: "f002", productName: "Cashmere-blend Sweater", supplierId: "fashion-hogar-zamora" },
    { id: "ORD-002", customerName: "Juan Pérez", customerPhone: "3532222222", customerAddress: "Calle Hidalgo 456, Zamora Norte", customerZone: "z2", total: 378.0, paymentMethod: "cash", status: "shipped" as const, productId: "h001", productName: "Pro Blender 1200W", supplierId: "fashion-hogar-zamora" },
    { id: "ORD-003", customerName: "Ana Torres", customerPhone: "3533333333", customerAddress: "Blvd. López Mateos 789, Jacona", customerZone: "z4", total: 68.0, paymentMethod: "transfer", status: "processing" as const, productId: "s001", productName: "Yoga Mat 6mm", supplierId: "deportes-tech-zamora" },
    { id: "ORD-004", customerName: "Carlos Rios", customerPhone: "3534444444", customerAddress: "Calle Juárez 321, Zamora Centro", customerZone: "z1", total: 289.0, paymentMethod: "card", status: "pending" as const, productId: "e001", productName: "SmartWatch Pro", supplierId: "deportes-tech-zamora" },
    { id: "ORD-005", customerName: "Luisa Mora", customerPhone: "3535555555", customerAddress: "Av. Revolución 654, Zamora Sur", customerZone: "z3", total: 119.0, paymentMethod: "transfer", status: "returned" as const, productId: "f001", productName: "Linen-blend Jacket", supplierId: "fashion-hogar-zamora" },
  ];

  for (const o of ordersData) {
    await prisma.order.upsert({
      where: { id: o.id },
      update: {},
      create: {
        id: o.id,
        status: o.status,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        customerAddress: o.customerAddress,
        customerZone: o.customerZone,
        total: o.total,
        paymentMethod: o.paymentMethod,
        items: {
          create: {
            productId: o.productId,
            name: o.productName,
            price: o.total,
            qty: 1,
            supplierId: o.supplierId,
            supplierName: o.supplierId === "fashion-hogar-zamora" ? "Moda & Hogar Zamora" : "Deportes & Tech Zamora",
          },
        },
        packages: {
          create: {
            supplierId: o.supplierId,
            supplierName: o.supplierId === "fashion-hogar-zamora" ? "Moda & Hogar Zamora" : "Deportes & Tech Zamora",
            supplierEmail: o.supplierId === "fashion-hogar-zamora" ? "proveedor@mariasclub.com" : "proveedor2@mariasclub.com",
            itemIds: [o.productId],
            status: o.status === "delivered" ? "picked_up" : o.status === "shipped" ? "picked_up" : o.status === "processing" ? "ready" : "pending",
          },
        },
      },
    });
  }

  console.log("Orders created");
  console.log("\nSeed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
