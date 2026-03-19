export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { shippingZones } from '@/lib/db/schema';

export async function GET() {
  try {
    const zones = await db.select().from(shippingZones);
    return NextResponse.json({ zones });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { zoneName, zoneNameAr, price, freeThreshold, estimatedDays } = await req.json();
    const [zone] = await db.insert(shippingZones).values({
      zoneName,
      zoneNameAr: zoneNameAr || null,
      price: price.toFixed(3),
      freeThreshold: freeThreshold ? freeThreshold.toFixed(3) : null,
      estimatedDays: estimatedDays || 3,
    }).returning();
    return NextResponse.json({ zone, success: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
