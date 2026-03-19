'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ChevronDown, Truck, X } from 'lucide-react';
import { formatPrice, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

interface AdminOrdersClientProps {
  orders: any[];
  locale: string;
}

export default function AdminOrdersClient({ orders, locale }: AdminOrdersClientProps) {
  const isRTL = locale === 'ar';
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filtered = filterStatus ? orders.filter((o) => o.status === filterStatus) : orders;

  const updateStatus = async (orderId: number, status: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      toast.success(isRTL ? 'تم تحديث الحالة' : 'Status updated');
      router.refresh();
    } catch {
      toast.error('Failed to update');
    }
  };

  const addTracking = async (orderId: number) => {
    if (!trackingInput.trim()) return;
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber: trackingInput, status: 'shipped' }),
      });
      toast.success(isRTL ? 'تم إضافة رقم التتبع' : 'Tracking number added');
      setTrackingInput('');
      router.refresh();
    } catch {
      toast.error('Failed to update');
    }
  };

  const statusLabels: Record<string, string> = isRTL
    ? { pending: 'قيد الانتظار', confirmed: 'مؤكد', shipped: 'تم الشحن', delivered: 'تم التسليم', cancelled: 'ملغي' }
    : { pending: 'Pending', confirmed: 'Confirmed', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        <div className={isRTL ? 'text-right' : ''}>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
            {isRTL ? 'الطلبات' : 'Orders'}
          </h1>
          <p className="text-gray-500">{filtered.length} {isRTL ? 'طلب' : 'orders'}</p>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field w-auto"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <option value="">{isRTL ? 'كل الحالات' : 'All Status'}</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{statusLabels[s]}</option>
          ))}
        </select>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-glass rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/80">
              <tr className={isRTL ? 'text-right' : 'text-left'}>
                {[
                  isRTL ? 'رقم الطلب' : 'Order #',
                  isRTL ? 'العميل' : 'Customer',
                  isRTL ? 'الإجمالي' : 'Total',
                  isRTL ? 'الحالة' : 'Status',
                  isRTL ? 'التاريخ' : 'Date',
                  isRTL ? 'إجراءات' : 'Actions',
                ].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400">
                    {isRTL ? 'لا توجد طلبات' : 'No orders yet'}
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className={`px-4 py-3 font-mono font-semibold text-rose-600 text-sm ${isRTL ? 'text-right' : ''}`}>
                      {order.orderNumber}
                    </td>
                    <td className={`px-4 py-3 ${isRTL ? 'text-right' : ''}`}>
                      <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                      <p className="text-xs text-gray-400">{order.customerEmail}</p>
                    </td>
                    <td className={`px-4 py-3 font-semibold text-sm ${isRTL ? 'text-right' : ''}`}>
                      {formatPrice(order.totalPrice, locale)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border-0 cursor-pointer appearance-none pr-6 ${getStatusColor(order.status)}`}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>{statusLabels[s]}</option>
                          ))}
                        </select>
                        <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-xs text-gray-500 ${isRTL ? 'text-right' : ''}`}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { setSelectedOrder(order); setTrackingInput(order.trackingNumber || ''); }}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className={`fixed inset-4 sm:inset-8 z-[60] bg-white rounded-3xl shadow-2xl overflow-y-auto ${isRTL ? 'text-right' : ''}`}
            >
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="font-bold text-xl">
                  {isRTL ? 'تفاصيل الطلب' : 'Order Details'} — {selectedOrder.orderNumber}
                </h2>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">{isRTL ? 'معلومات العميل' : 'Customer Info'}</h3>
                    {[
                      [isRTL ? 'الاسم' : 'Name', selectedOrder.customerName],
                      [isRTL ? 'البريد' : 'Email', selectedOrder.customerEmail],
                      [isRTL ? 'الهاتف' : 'Phone', selectedOrder.customerPhone || '—'],
                    ].map(([label, value]) => (
                      <div key={label} className={`flex justify-between py-1 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="text-gray-500">{label}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>

                  {selectedOrder.address && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-800 mb-3">{isRTL ? 'عنوان التسليم' : 'Delivery Address'}</h3>
                      <p className="text-sm text-gray-700">{selectedOrder.address.street}</p>
                      <p className="text-sm text-gray-700">{selectedOrder.address.city}, {selectedOrder.address.governorate}</p>
                      {selectedOrder.address.postalCode && <p className="text-sm text-gray-500">{selectedOrder.address.postalCode}</p>}
                    </div>
                  )}
                </div>

                {/* Items */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">{isRTL ? 'عناصر الطلب' : 'Order Items'}</h3>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item: any) => (
                      <div key={item.id} className={`flex justify-between items-center p-3 bg-gray-50 rounded-xl text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={isRTL ? 'text-right' : ''}>
                          <p className="font-medium">{item.productTitle}</p>
                          <p className="text-gray-500 text-xs">{item.size} / {item.color} × {item.quantity}</p>
                        </div>
                        <span className="font-semibold text-rose-600">
                          {(parseFloat(item.priceAtPurchase) * item.quantity).toFixed(3)} JOD
                        </span>
                      </div>
                    ))}
                    <div className={`flex justify-between font-bold text-base pt-2 border-t ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
                      <span className="text-rose-600">{parseFloat(selectedOrder.totalPrice).toFixed(3)} JOD</span>
                    </div>
                  </div>
                </div>

                {/* Tracking */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">{isRTL ? 'رقم التتبع' : 'Tracking Number'}</h3>
                  <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <input
                      type="text"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      placeholder={isRTL ? 'أدخل رقم التتبع' : 'Enter tracking number'}
                      className="input-field flex-1"
                    />
                    <button
                      onClick={() => addTracking(selectedOrder.id)}
                      className={`btn-primary flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <Truck size={16} />
                      {isRTL ? 'حفظ' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
