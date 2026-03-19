export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { categories, categoryTranslations } from '@/lib/db/schema';

export async function POST(req: NextRequest) {
  try {
    const { slug, translations } = await req.json();

    const [cat] = await db.insert(categories).values({ slug }).returning();

    if (translations?.length > 0) {
      await db.insert(categoryTranslations).values(
        translations.map((t: any) => ({
          categoryId: cat.id,
          language: t.language,
          name: t.name,
        }))
      );
    }

    return NextResponse.json({ category: cat, success: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
