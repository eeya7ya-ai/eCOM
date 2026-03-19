export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  products, productTranslations, productImages, productVariants,
  categories, categoryTranslations
} from '@/lib/db/schema';
import { eq, and, ilike, gte, lte, sql } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const locale = searchParams.get('locale') || 'en';

    let result = await db.select().from(products).where(eq(products.isActive, true));

    if (category) {
      const cat = await db.select().from(categories).where(eq(categories.slug, category));
      if (cat.length > 0) {
        result = result.filter((p) => p.categoryId === cat[0].id);
      }
    }

    const fullProducts = await Promise.all(
      result.map(async (p) => {
        const [translations, images, variants] = await Promise.all([
          db.select().from(productTranslations).where(eq(productTranslations.productId, p.id)),
          db.select().from(productImages).where(eq(productImages.productId, p.id)).orderBy(productImages.displayOrder),
          db.select().from(productVariants).where(eq(productVariants.productId, p.id)),
        ]);
        return { ...p, translations, images, variants };
      })
    );

    let filtered = fullProducts;
    if (search) {
      filtered = filtered.filter((p) =>
        p.translations.some((t) => t.title.toLowerCase().includes(search.toLowerCase()))
      );
    }

    return NextResponse.json({ products: filtered });
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, price, categoryId, isActive, isFeatured, isNewArrival, translations, images, variants } = body;

    const [product] = await db.insert(products).values({
      slug: slug || `product-${Date.now()}`,
      price: price.toFixed(3),
      categoryId: categoryId || null,
      isActive: isActive ?? true,
      isFeatured: isFeatured ?? false,
      isNewArrival: isNewArrival ?? false,
    }).returning();

    if (translations?.length > 0) {
      await db.insert(productTranslations).values(
        translations.map((t: any) => ({
          productId: product.id,
          language: t.language,
          title: t.title,
          description: t.description || null,
        }))
      );
    }

    if (images?.length > 0) {
      await db.insert(productImages).values(
        images.map((img: any) => ({
          productId: product.id,
          imageUrl: img.imageUrl,
          displayOrder: img.displayOrder || 0,
        }))
      );
    }

    if (variants?.length > 0) {
      await db.insert(productVariants).values(
        variants.map((v: any) => ({
          productId: product.id,
          size: v.size,
          color: v.color,
          colorCode: v.colorCode || null,
          stockQuantity: v.stockQuantity || 0,
        }))
      );
    }

    return NextResponse.json({ product, success: true });
  } catch (error) {
    console.error('POST /api/products error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
