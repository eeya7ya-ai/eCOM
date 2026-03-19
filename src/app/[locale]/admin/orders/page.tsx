export const dynamic = 'force-dynamic';
import AdminOrdersClient from '@/components/admin/AdminOrdersClient';
import { db } from '@/lib/db';
import { orders, orderItems, addresses } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

async function getOrders() {
  try {
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
    return await Promise.all(
      allOrders.map(async (o) => {
        const [items, addressArr] = await Promise.all([
          db.select().from(orderItems).where(eq(orderItems.orderId, o.id)),
          db.select().from(addresses).where(eq(addresses.orderId, o.id)),
        ]);
        return { ...o, items, address: addressArr[0] };
      })
    );
  } catch {
    return [];
  }
}

export default async function AdminOrdersPage({ params: { locale } }: { params: { locale: string } }) {
  const allOrders = await getOrders();
  return <AdminOrdersClient orders={allOrders} locale={locale} />;
}
