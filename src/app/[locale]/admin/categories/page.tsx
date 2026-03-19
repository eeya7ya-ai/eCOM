export const dynamic = 'force-dynamic';
import AdminCategoriesClient from '@/components/admin/AdminCategoriesClient';
import { db } from '@/lib/db';
import { categories, categoryTranslations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function AdminCategoriesPage({ params: { locale } }: { params: { locale: string } }) {
  const cats = await db.select().from(categories).catch(() => []);
  const full = await Promise.all(cats.map(async (c) => {
    const translations = await db.select().from(categoryTranslations).where(eq(categoryTranslations.categoryId, c.id));
    return { ...c, translations };
  }));
  return <AdminCategoriesClient categories={full} locale={locale} />;
}
