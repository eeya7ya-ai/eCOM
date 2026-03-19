export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems, addresses } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get('orderNumber');
    const email = searchParams.get('email');

    if (!orderNumber || !email) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const result = await db.select().from(orders).where(
      and(
        eq(orders.orderNumber, orderNumber.trim()),
        eq(orders.customerEmail, email.trim().toLowerCase())
      )
    );

    if (!result.length) {
      return NextResponse.json({ order: null });
    }

    const order = result[0];
    const [items, addressArr] = await Promise.all([
      db.select().from(orderItems).where(eq(orderItems.orderId, order.id)),
      db.select().from(addresses).where(eq(addresses.orderId, order.id)),
    ]);

    return NextResponse.json({ order: { ...order, items, address: addressArr[0] } });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
