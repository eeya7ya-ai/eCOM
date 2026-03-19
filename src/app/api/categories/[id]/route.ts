export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { categories, categoryTranslations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const { slug, translations } = await req.json();

    await db.update(categories).set({ slug }).where(eq(categories.id, id));

    if (translations) {
      await db.delete(categoryTranslations).where(eq(categoryTranslations.categoryId, id));
      if (translations.length > 0) {
        await db.insert(categoryTranslations).values(
          translations.map((t: any) => ({ categoryId: id, language: t.language, name: t.name }))
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.delete(categories).where(eq(categories.id, parseInt(params.id)));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
