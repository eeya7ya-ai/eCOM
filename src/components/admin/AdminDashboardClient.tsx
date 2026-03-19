'use client';
import { motion } from 'framer-motion';
import { ShoppingCart, DollarSign, Package, AlertTriangle, TrendingUp, Eye } from 'lucide-react';
import { formatPrice, getStatusColor } from '@/lib/utils';
import Link from 'next/link';

interface DashboardData {
  todayOrdersCount: number;
  monthOrdersCount: number;
  todayRevenue: number;
  monthRevenue: number;
  recentOrders: any[];
  lowStockCount: number;
  totalProducts: number;
}

interface Props {
  data: DashboardData;
  locale: string;
}

export default function AdminDashboardClient({ data, locale }: Props) {
  const isRTL = locale === 'ar';

  const stats = [
    {
      label: isRTL ? 'طلبات اليوم' : 'Orders Today',
      value: data.todayOrdersCount,
      icon: ShoppingCart,
      gradient: 'from-rose-500 to-pink-600',
      bg: 'from-rose-50 to-pink-50',
      sub: `${data.monthOrdersCount} ${isRTL ? 'هذا الشهر' : 'this month'}`,
    },
    {
      label: isRTL ? 'إيرادات اليوم' : 'Today\'s Revenue',
      value: formatPrice(data.todayRevenue, locale),
      icon: DollarSign,
      gradient: 'from-purple-500 to-violet-600',
      bg: 'from-purple-50 to-violet-50',
      sub: `${formatPrice(data.monthRevenue, locale)} ${isRTL ? 'هذا الشهر' : 'this month'}`,
    },
    {
      label: isRTL ? 'إجمالي المنتجات' : 'Total Products',
      value: data.totalProducts,
      icon: Package,
      gradient: 'from-amber-500 to-orange-600',
      bg: 'from-amber-50 to-orange-50',
      sub: isRTL ? 'منتجات نشطة' : 'Active products',
    },
    {
      label: isRTL ? 'تنبيهات المخزون' : 'Low Stock Alerts',
      value: data.lowStockCount,
      icon: AlertTriangle,
      gradient: 'from-red-500 to-rose-600',
      bg: 'from-red-50 to-rose-50',
      sub: isRTL ? 'متغيرات منخفضة' : 'Low variants',
      urgent: data.lowStockCount > 0,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={isRTL ? 'text-right' : ''}>
        <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
          {isRTL ? 'لوحة التحكم' : 'Dashboard'}
        </h1>
        <p className="text-gray-500 mt-1">{new Date().toLocaleDateString(isRTL ? 'ar-JO' : 'en-JO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`card-glass rounded-2xl p-6 ${stat.urgent ? 'animate-pulse-glow' : ''}`}
          >
            <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
                <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.gradient}`}>
                <stat.icon size={22} className="text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card-glass rounded-2xl p-6"
      >
        <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h2 className={`font-bold text-xl text-gray-900 ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'أحدث الطلبات' : 'Recent Orders'}
          </h2>
          <Link href={`/${locale}/admin/orders`}>
            <button className={`flex items-center gap-2 text-sm text-rose-600 hover:text-rose-700 font-medium ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Eye size={14} />
              {isRTL ? 'عرض الكل' : 'View All'}
            </button>
          </Link>
        </div>

        {data.recentOrders.length === 0 ? (
          <p className={`text-gray-400 text-center py-8 ${isRTL ? '' : ''}`}>
            {isRTL ? 'لا توجد طلبات بعد' : 'No orders yet'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b border-gray-100 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {[
                    isRTL ? 'رقم الطلب' : 'Order #',
                    isRTL ? 'العميل' : 'Customer',
                    isRTL ? 'الإجمالي' : 'Total',
                    isRTL ? 'الحالة' : 'Status',
                    isRTL ? 'التاريخ' : 'Date',
                  ].map((h) => (
                    <th key={h} className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className={`py-3 text-sm font-mono font-semibold text-rose-600 ${isRTL ? 'text-right' : ''}`}>
                      {order.orderNumber}
                    </td>
                    <td className={`py-3 text-sm text-gray-700 ${isRTL ? 'text-right' : ''}`}>
                      {order.customerName}
                    </td>
                    <td className={`py-3 text-sm font-semibold ${isRTL ? 'text-right' : ''}`}>
                      {formatPrice(order.totalPrice, locale)}
                    </td>
                    <td className={`py-3 ${isRTL ? 'text-right' : ''}`}>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className={`py-3 text-xs text-gray-500 ${isRTL ? 'text-right' : ''}`}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {[
          { href: `/${locale}/admin/products`, label: isRTL ? 'إضافة منتج' : 'Add Product', icon: '➕', gradient: 'from-rose-500 to-pink-600' },
          { href: `/${locale}/admin/orders`, label: isRTL ? 'إدارة الطلبات' : 'Manage Orders', icon: '📦', gradient: 'from-purple-500 to-violet-600' },
          { href: `/${locale}/admin/shipping`, label: isRTL ? 'الشحن' : 'Shipping', icon: '🚚', gradient: 'from-amber-500 to-orange-600' },
          { href: `/${locale}/admin/categories`, label: isRTL ? 'الفئات' : 'Categories', icon: '🏷️', gradient: 'from-teal-500 to-emerald-600' },
        ].map((link) => (
          <Link key={link.href} href={link.href}>
            <motion.div
              whileHover={{ y: -3 }}
              className={`p-4 rounded-xl bg-gradient-to-br ${link.gradient} text-white cursor-pointer shadow-lg hover:shadow-xl transition-all`}
            >
              <div className="text-2xl mb-2">{link.icon}</div>
              <p className={`text-sm font-semibold ${isRTL ? 'text-right' : ''}`}>{link.label}</p>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
