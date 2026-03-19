export const dynamic = 'force-dynamic';
import AdminProductsClient from '@/components/admin/AdminProductsClient';
import { db } from '@/lib/db';
import { products, productTranslations, productImages, productVariants, categories, categoryTranslations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function getData() {
  try {
    const allProducts = await db.select().from(products).orderBy(products.createdAt);
    const fullProducts = await Promise.all(
      allProducts.map(async (p) => {
        const [translations, images, variants] = await Promise.all([
          db.select().from(productTranslations).where(eq(productTranslations.productId, p.id)),
          db.select().from(productImages).where(eq(productImages.productId, p.id)),
          db.select().from(productVariants).where(eq(productVariants.productId, p.id)),
        ]);
        return { ...p, translations, images, variants };
      })
    );

    const cats = await db.select().from(categories);
    const fullCats = await Promise.all(
      cats.map(async (c) => {
        const translations = await db.select().from(categoryTranslations).where(eq(categoryTranslations.categoryId, c.id));
        return { ...c, translations };
      })
    );

    return { products: fullProducts, categories: fullCats };
  } catch {
    return { products: [], categories: [] };
  }
}

export default async function AdminProductsPage({ params: { locale } }: { params: { locale: string } }) {
  const { products: prods, categories: cats } = await getData();
  return <AdminProductsClient products={prods} categories={cats} locale={locale} />;
}
