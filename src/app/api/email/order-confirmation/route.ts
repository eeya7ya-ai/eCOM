export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { db } from '@/lib/db';
import { orders, orderItems, addresses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { orderId, orderNumber, customerEmail, customerName } = await req.json();

    const orderArr = await db.select().from(orders).where(eq(orders.id, orderId));
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    const addressArr = await db.select().from(addresses).where(eq(addresses.orderId, orderId));

    const order = orderArr[0];
    const address = addressArr[0];

    const itemsHtml = items.map((item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">${item.productTitle} (${item.size}/${item.color})</td>
        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; text-align: right;">${(parseFloat(item.priceAtPurchase) * item.quantity).toFixed(3)} JOD</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html dir="ltr">
      <head><meta charset="UTF-8"><title>Order Confirmation</title></head>
      <body style="font-family: 'Inter', Arial, sans-serif; background: linear-gradient(135deg, #fdf2f8, #ede9fe); margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f43f5e, #8b5cf6); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; font-size: 32px; margin: 0; font-family: Georgia, serif;">LUMIÈRE</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">Women's Fashion Store</p>
          </div>

          <!-- Success Banner -->
          <div style="background: linear-gradient(135deg, #ecfdf5, #d1fae5); padding: 24px 30px; text-align: center; border-bottom: 2px solid #a7f3d0;">
            <div style="font-size: 48px; margin-bottom: 8px;">🎉</div>
            <h2 style="color: #065f46; margin: 0; font-size: 22px;">Order Confirmed!</h2>
            <p style="color: #047857; margin: 6px 0 0;">Thank you for shopping with us, ${customerName}!</p>
          </div>

          <!-- Order Number -->
          <div style="padding: 24px 30px; background: #fdf2f8; border-bottom: 1px solid #fce7f3; text-align: center;">
            <p style="color: #9f1239; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 6px;">Order Number</p>
            <p style="color: #e11d48; font-size: 28px; font-weight: bold; font-family: monospace; margin: 0;">${orderNumber}</p>
          </div>

          <!-- Items -->
          <div style="padding: 24px 30px;">
            <h3 style="color: #1f2937; margin: 0 0 16px;">Order Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f9fafb;">
                  <th style="padding: 10px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase;">Item</th>
                  <th style="padding: 10px; text-align: center; font-size: 12px; color: #6b7280; text-transform: uppercase;">Qty</th>
                  <th style="padding: 10px; text-align: right; font-size: 12px; color: #6b7280; text-transform: uppercase;">Price</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            <div style="border-top: 2px solid #f3f4f6; margin-top: 16px; padding-top: 16px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6b7280;">Shipping</span>
                <span style="font-weight: 600;">${parseFloat(order?.shippingCost || '0').toFixed(3)} JOD</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold;">
                <span>Total</span>
                <span style="color: #e11d48;">${parseFloat(order?.totalPrice || '0').toFixed(3)} JOD</span>
              </div>
            </div>
          </div>

          ${address ? `
          <!-- Address -->
          <div style="padding: 24px 30px; background: #f9fafb; border-top: 1px solid #f3f4f6;">
            <h3 style="color: #1f2937; margin: 0 0 10px; font-size: 14px;">📍 Delivery Address</h3>
            <p style="color: #4b5563; margin: 0; line-height: 1.6;">${address.street}<br>${address.city}, ${address.governorate}</p>
          </div>
          ` : ''}

          <!-- Footer -->
          <div style="padding: 24px 30px; text-align: center; background: #1f2937; color: #9ca3af;">
            <p style="margin: 0 0 8px; font-size: 14px;">Questions? Reply to this email or contact us</p>
            <p style="margin: 0; font-size: 12px;">© 2024 LUMIÈRE - Women's Fashion Store, Amman, Jordan</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'LUMIÈRE <noreply@lumiere.jo>',
      to: customerEmail,
      subject: `Order Confirmed: ${orderNumber} — LUMIÈRE`,
      html,
    });

    // Admin notification
    if (process.env.ADMIN_EMAIL) {
      await resend.emails.send({
        from: process.env.FROM_EMAIL || 'LUMIÈRE <noreply@lumiere.jo>',
        to: process.env.ADMIN_EMAIL,
        subject: `🛍️ New Order: ${orderNumber}`,
        html: `<p>New order received from <strong>${customerName}</strong> (${customerEmail})</p><p>Total: ${parseFloat(order?.totalPrice || '0').toFixed(3)} JOD</p>`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Email error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
