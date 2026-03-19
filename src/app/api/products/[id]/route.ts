export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, productTranslations, productImages, productVariants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();
    const { slug, price, categoryId, isActive, isFeatured, isNewArrival, translations, images, variants } = body;

    await db.update(products).set({
      slug: slug || undefined,
      price: price?.toFixed(3),
      categoryId: categoryId || null,
      isActive: isActive ?? true,
      isFeatured: isFeatured ?? false,
      isNewArrival: isNewArrival ?? false,
    }).where(eq(products.id, id));

    if (translations) {
      await db.delete(productTranslations).where(eq(productTranslations.productId, id));
      if (translations.length > 0) {
        await db.insert(productTranslations).values(
          translations.map((t: any) => ({
            productId: id,
            language: t.language,
            title: t.title,
            description: t.description || null,
          }))
        );
      }
    }

    if (images) {
      await db.delete(productImages).where(eq(productImages.productId, id));
      if (images.length > 0) {
        await db.insert(productImages).values(
          images.map((img: any) => ({
            productId: id,
            imageUrl: img.imageUrl,
            displayOrder: img.displayOrder || 0,
          }))
        );
      }
    }

    if (variants) {
      await db.delete(productVariants).where(eq(productVariants.productId, id));
      if (variants.length > 0) {
        await db.insert(productVariants).values(
          variants.map((v: any) => ({
            productId: id,
            size: v.size,
            color: v.color,
            colorCode: v.colorCode || null,
            stockQuantity: v.stockQuantity || 0,
          }))
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();
    await db.update(products).set(body).where(eq(products.id, id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to patch' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    await db.delete(products).where(eq(products.id, id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
