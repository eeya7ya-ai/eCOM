export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems, addresses } from '@/lib/db/schema';
import { generateOrderNumber } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName, customerEmail, customerPhone,
      address, items, totalPrice, shippingCost,
      shippingZoneId, stripePaymentIntentId,
    } = body;

    const orderNumber = generateOrderNumber();

    const [order] = await db.insert(orders).values({
      orderNumber,
      customerName,
      customerEmail,
      customerPhone: customerPhone || null,
      totalPrice: totalPrice.toFixed(3),
      shippingCost: (shippingCost || 0).toFixed(3),
      status: 'confirmed',
      stripePaymentIntentId: stripePaymentIntentId || null,
      shippingZoneId: shippingZoneId || null,
    }).returning();

    if (address) {
      await db.insert(addresses).values({
        orderId: order.id,
        street: address.street,
        city: address.city,
        governorate: address.governorate,
        postalCode: address.postalCode || null,
      });
    }

    if (items?.length > 0) {
      await db.insert(orderItems).values(
        items.map((item: any) => ({
          orderId: order.id,
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: item.quantity,
          priceAtPurchase: item.priceAtPurchase.toFixed(3),
          productTitle: item.productTitle || null,
          size: item.size || null,
          color: item.color || null,
          imageUrl: item.imageUrl || null,
        }))
      );
    }

    // Send confirmation email (async, don't wait)
    try {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/order-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, orderNumber, customerEmail, customerName }),
      }).catch(() => {});
    } catch {}

    return NextResponse.json({ orderNumber, orderId: order.id, success: true });
  } catch (error) {
    console.error('POST /api/orders error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const allOrders = await db.select().from(orders);
    return NextResponse.json({ orders: allOrders });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
