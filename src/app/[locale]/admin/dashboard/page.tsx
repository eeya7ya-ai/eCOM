export const dynamic = 'force-dynamic';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';
import { db } from '@/lib/db';
import { orders, products, productVariants } from '@/lib/db/schema';
import { gte, eq, and, lte, lt, sql } from 'drizzle-orm';

async function getDashboardData() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      todayOrders,
      monthOrders,
      allOrders,
      lowStockVariants,
      totalProducts,
    ] = await Promise.all([
      db.select().from(orders).where(gte(orders.createdAt, today)),
      db.select().from(orders).where(gte(orders.createdAt, monthStart)),
      db.select().from(orders).orderBy(sql`${orders.createdAt} desc`).limit(10),
      db.select().from(productVariants).where(lt(productVariants.stockQuantity, 5)),
      db.select().from(products).where(eq(products.isActive, true)),
    ]);

    const todayRevenue = todayOrders.reduce((sum, o) => sum + parseFloat(o.totalPrice), 0);
    const monthRevenue = monthOrders.reduce((sum, o) => sum + parseFloat(o.totalPrice), 0);

    return {
      todayOrdersCount: todayOrders.length,
      monthOrdersCount: monthOrders.length,
      todayRevenue,
      monthRevenue,
      recentOrders: allOrders,
      lowStockCount: lowStockVariants.length,
      totalProducts: totalProducts.length,
    };
  } catch {
    return {
      todayOrdersCount: 0,
      monthOrdersCount: 0,
      todayRevenue: 0,
      monthRevenue: 0,
      recentOrders: [],
      lowStockCount: 0,
      totalProducts: 0,
    };
  }
}

export default async function DashboardPage({ params: { locale } }: { params: { locale: string } }) {
  const data = await getDashboardData();
  return <AdminDashboardClient data={data} locale={locale} />;
}
