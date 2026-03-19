export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems, addresses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const identifier = params.id;
    let result;

    if (isNaN(parseInt(identifier))) {
      // Order number lookup
      result = await db.select().from(orders).where(eq(orders.orderNumber, identifier));
    } else {
      result = await db.select().from(orders).where(eq(orders.id, parseInt(identifier)));
    }

    if (!result.length) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();

    const updateData: any = {};
    if (body.status) updateData.status = body.status;
    if (body.trackingNumber) updateData.trackingNumber = body.trackingNumber;

    await db.update(orders).set(updateData).where(eq(orders.id, id));

    // If shipped, send email
    if (body.status === 'shipped' || body.trackingNumber) {
      const orderArr = await db.select().from(orders).where(eq(orders.id, id));
      if (orderArr.length) {
        try {
          fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/order-shipped`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: id,
              orderNumber: orderArr[0].orderNumber,
              customerEmail: orderArr[0].customerEmail,
              trackingNumber: body.trackingNumber || orderArr[0].trackingNumber,
            }),
          }).catch(() => {});
        } catch {}
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
