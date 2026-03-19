export const dynamic = 'force-dynamic';
import ShopClient from '@/components/shop/ShopClient';
import { db } from '@/lib/db';
import { products, productTranslations, productImages, productVariants, categories, categoryTranslations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function getProducts() {
  try {
    const result = await db.select().from(products).where(eq(products.isActive, true));

    const fullProducts = await Promise.all(
      result.map(async (p) => {
        const [translations, images, variants] = await Promise.all([
          db.select().from(productTranslations).where(eq(productTranslations.productId, p.id)),
          db.select().from(productImages).where(eq(productImages.productId, p.id)),
          db.select().from(productVariants).where(eq(productVariants.productId, p.id)),
        ]);
        return { ...p, translations, images, variants };
      })
    );

    return fullProducts;
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    const cats = await db.select().from(categories);
    const withTranslations = await Promise.all(
      cats.map(async (c) => {
        const translations = await db.select().from(categoryTranslations).where(
          eq(categoryTranslations.categoryId, c.id)
        );
        return { ...c, translations };
      })
    );
    return withTranslations;
  } catch {
    return [];
  }
}

export default async function ShopPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: Record<string, string>;
}) {
  const [allProducts, cats] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <ShopClient
      initialProducts={allProducts}
      categories={cats}
      locale={locale}
      searchParams={searchParams}
    />
  );
}
