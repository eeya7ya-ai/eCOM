export const dynamic = 'force-dynamic';
import CheckoutClient from '@/components/checkout/CheckoutClient';
import { db } from '@/lib/db';
import { shippingZones } from '@/lib/db/schema';

async function getShippingZones() {
  try {
    return await db.select().from(shippingZones);
  } catch {
    return [];
  }
}

export default async function CheckoutPage({ params: { locale } }: { params: { locale: string } }) {
  const zones = await getShippingZones();
  return <CheckoutClient locale={locale} shippingZones={zones} />;
}
