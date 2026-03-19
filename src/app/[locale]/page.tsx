export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import NewArrivals from '@/components/home/NewArrivals';
import PromoBanner from '@/components/home/PromoBanner';
import StatsSection from '@/components/home/StatsSection';
import { db } from '@/lib/db';
import { products, productTranslations, productImages, productVariants, categories, categoryTranslations } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

async function getFeaturedProducts() {
  try {
    const result = await db.select().from(products).where(
      and(eq(products.isActive, true), eq(products.isFeatured, true))
    ).limit(8);

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

async function getNewArrivals() {
  try {
    const result = await db.select().from(products).where(
      and(eq(products.isActive, true), eq(products.isNewArrival, true))
    ).limit(8);

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

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const [featuredProducts, newArrivals, cats] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen">
      <HeroSection locale={locale} />
      <StatsSection locale={locale} />
      <CategorySection categories={cats} locale={locale} />
      <FeaturedProducts products={featuredProducts} locale={locale} />
      <PromoBanner locale={locale} />
      <NewArrivals products={newArrivals} locale={locale} />
    </div>
  );
}
