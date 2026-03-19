export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { products, productTranslations, productImages, productVariants, categories, categoryTranslations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import ProductPageClient from '@/components/product/ProductPageClient';

async function getProduct(slug: string) {
  try {
    const result = await db.select().from(products).where(
      and(eq(products.slug, slug), eq(products.isActive, true))
    ).limit(1);

    if (!result.length) return null;

    const product = result[0];
    const [translations, images, variants] = await Promise.all([
      db.select().from(productTranslations).where(eq(productTranslations.productId, product.id)),
      db.select().from(productImages).where(eq(productImages.productId, product.id)).orderBy(productImages.displayOrder),
      db.select().from(productVariants).where(eq(productVariants.productId, product.id)),
    ]);

    let category = null;
    if (product.categoryId) {
      const cats = await db.select().from(categories).where(eq(categories.id, product.categoryId));
      if (cats.length) {
        const catTranslations = await db.select().from(categoryTranslations).where(
          eq(categoryTranslations.categoryId, cats[0].id)
        );
        category = { ...cats[0], translations: catTranslations };
      }
    }

    return { ...product, translations, images, variants, category };
  } catch {
    return null;
  }
}

async function getRelatedProducts(categoryId: number | null, currentId: number) {
  if (!categoryId) return [];
  try {
    const result = await db.select().from(products).where(
      and(
        eq(products.categoryId, categoryId),
        eq(products.isActive, true)
      )
    ).limit(5);

    const filtered = result.filter((p) => p.id !== currentId).slice(0, 4);
    return await Promise.all(
      filtered.map(async (p) => {
        const [translations, images, variants] = await Promise.all([
          db.select().from(productTranslations).where(eq(productTranslations.productId, p.id)),
          db.select().from(productImages).where(eq(productImages.productId, p.id)),
          db.select().from(productVariants).where(eq(productVariants.productId, p.id)),
        ]);
        return { ...p, translations, images, variants };
      })
    );
  } catch {
    return [];
  }
}

export default async function ProductPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  const product = await getProduct(slug);
  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product.categoryId, product.id);

  return <ProductPageClient product={product} relatedProducts={relatedProducts} locale={locale} />;
}
