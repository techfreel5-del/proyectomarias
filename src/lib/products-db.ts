import { prisma } from "@/lib/prisma";
import { products as mockProducts, type Product } from "@/lib/mock-data";

// Convierte un producto de Prisma al tipo Product del frontend
function toProduct(p: {
  id: string; slug: string; name: string; category: string; subcategory: string;
  price: { toNumber: () => number } | number; originalPrice: { toNumber: () => number } | number | null;
  images: string[]; colors: unknown; sizes: string[]; description: string;
  badge: string | null; inStock: boolean; supplierId: string;
  supplier?: { displayName: string };
}): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category as Product["category"],
    subcategory: p.subcategory,
    price: typeof p.price === "object" ? p.price.toNumber() : p.price,
    originalPrice: p.originalPrice
      ? typeof p.originalPrice === "object"
        ? p.originalPrice.toNumber()
        : p.originalPrice
      : undefined,
    images: p.images,
    colors: p.colors as Product["colors"],
    sizes: p.sizes,
    description: p.description,
    badge: p.badge as Product["badge"],
    inStock: p.inStock,
    supplierId: p.supplierId,
    supplierName: p.supplier?.displayName ?? p.supplierId,
  };
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const rows = await prisma.product.findMany({
      where: { active: true },
      include: { supplier: { select: { displayName: true } } },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toProduct);
  } catch {
    return mockProducts;
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const rows = await prisma.product.findMany({
      where: { active: true, category },
      include: { supplier: { select: { displayName: true } } },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toProduct);
  } catch {
    return mockProducts.filter((p) => p.category === category);
  }
}

export async function getFeaturedProductsDB(): Promise<Product[]> {
  try {
    const rows = await prisma.product.findMany({
      where: { active: true, badge: { not: null } },
      include: { supplier: { select: { displayName: true } } },
      take: 6,
    });
    return rows.map(toProduct);
  } catch {
    return mockProducts.filter((p) => p.badge).slice(0, 6);
  }
}

export async function getProductBySlugDB(slug: string): Promise<Product | null> {
  try {
    const row = await prisma.product.findFirst({
      where: { slug, active: true },
      include: { supplier: { select: { displayName: true } } },
    });
    return row ? toProduct(row) : null;
  } catch {
    return mockProducts.find((p) => p.slug === slug) ?? null;
  }
}

export async function getAllSlugs(): Promise<string[]> {
  try {
    const rows = await prisma.product.findMany({
      where: { active: true },
      select: { slug: true },
    });
    return rows.map((r) => r.slug);
  } catch {
    return mockProducts.map((p) => p.slug);
  }
}
