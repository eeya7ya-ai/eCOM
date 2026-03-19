export const dynamic = 'force-dynamic';
import AdminShippingClient from '@/components/admin/AdminShippingClient';
import { db } from '@/lib/db';
import { shippingZones } from '@/lib/db/schema';

export default async function AdminShippingPage({ params: { locale } }: { params: { locale: string } }) {
  const zones = await db.select().from(shippingZones).catch(() => []);
  return <AdminShippingClient zones={zones} locale={locale} />;
}
