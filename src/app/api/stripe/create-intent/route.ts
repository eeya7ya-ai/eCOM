export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();

    // Convert JOD to fils (1 JOD = 1000 fils)
    const amountInFils = Math.round(amount * 1000);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInFils,
      currency: 'jod',
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
