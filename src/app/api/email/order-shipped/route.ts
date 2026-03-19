export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { orderNumber, customerEmail, trackingNumber } = await req.json();

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background: #fdf2f8; padding: 20px;">
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #8b5cf6, #f43f5e); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-family: Georgia, serif;">LUMIÈRE</h1>
          </div>
          <div style="padding: 30px; text-align: center;">
            <div style="font-size: 64px; margin-bottom: 16px;">🚚</div>
            <h2 style="color: #1f2937;">Your Order is on its way!</h2>
            <p style="color: #6b7280;">Order <strong>${orderNumber}</strong> has been shipped.</p>
            ${trackingNumber ? `
            <div style="background: #f3f4f6; border-radius: 12px; padding: 16px; margin: 20px 0;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 6px; text-transform: uppercase; letter-spacing: 1px;">Tracking Number</p>
              <p style="color: #7c3aed; font-size: 20px; font-weight: bold; font-family: monospace; margin: 0;">${trackingNumber}</p>
            </div>
            ` : ''}
            <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">Thank you for shopping with LUMIÈRE!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'LUMIÈRE <noreply@lumiere.jo>',
      to: customerEmail,
      subject: `Your Order ${orderNumber} has been shipped! 🚚 — LUMIÈRE`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
