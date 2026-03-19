export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { shippingZones } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const { zoneName, zoneNameAr, price, freeThreshold, estimatedDays } = await req.json();
    await db.update(shippingZones).set({
      zoneName,
      zoneNameAr: zoneNameAr || null,
      price: parseFloat(price).toFixed(3),
      freeThreshold: freeThreshold ? parseFloat(freeThreshold).toFixed(3) : null,
      estimatedDays: estimatedDays || 3,
    }).where(eq(shippingZones.id, id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.delete(shippingZones).where(eq(shippingZones.id, parseInt(params.id)));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
