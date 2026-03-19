'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Truck, CheckCircle, Clock, MapPin, AlertCircle } from 'lucide-react';

export default function OrderTrackingClient({ locale }: { locale: string }) {
  const isRTL = locale === 'ar';
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await fetch(`/api/tracking?orderNumber=${orderNumber}&email=${email}`);
      const data = await res.json();
      if (data.order) {
        setOrder(data.order);
      } else {
        setError(isRTL
          ? 'لم يتم العثور على الطلب. تحقق من رقم الطلب والبريد الإلكتروني.'
          : 'Order not found. Please check your order number and email.');
      }
    } catch {
      setError(isRTL ? 'حدث خطأ. يرجى المحاولة مجدداً.' : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = [
    { status: 'pending',   icon: Clock,        label: isRTL ? 'قيد الانتظار' : 'Pending' },
    { status: 'confirmed', icon: CheckCircle,  label: isRTL ? 'مؤكد'          : 'Confirmed' },
    { status: 'shipped',   icon: Truck,        label: isRTL ? 'تم الشحن'      : 'Shipped' },
    { status: 'delivered', icon: MapPin,       label: isRTL ? 'تم التسليم'    : 'Delivered' },
  ];
  const currentStep = order ? statusSteps.findIndex((s) => s.status === order.status) : -1;

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-purple-600 mb-4 shadow-xl">
            <Package size={28} className="text-white" />
          </div>
          <h1 className="section-title text-4xl mb-2">{isRTL ? 'تتبع طلبك' : 'Track Your Order'}</h1>
          <p className="text-gray-500">{isRTL ? 'أدخل تفاصيل طلبك لتتبع شحنتك' : 'Enter your order details to track your shipment'}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-glass rounded-2xl p-6 mb-8">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isRTL ? 'text-right' : ''}`}>{isRTL ? 'رقم الطلب' : 'Order Number'}</label>
              <input type="text" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="ORD-XXXXXX" className={`input-field font-mono ${isRTL ? 'text-right' : ''}`} required />
            </div>
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isRTL ? 'text-right' : ''}`}>{isRTL ? 'البريد الإلكتروني' : 'Email Address'}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" className={`input-field ${isRTL ? 'text-right' : ''}`} required />
            </div>
            <button type="submit" disabled={loading} className={`btn-primary w-full py-3.5 flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Search size={18} />
              {loading ? (isRTL ? 'جاري البحث...' : 'Searching...') : (isRTL ? 'تتبع الطلب' : 'Track Order')}
            </button>
          </form>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100 text-red-700 mb-6 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
              <AlertCircle size={18} className="flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {order && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-glass rounded-2xl p-6">
              <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-xs text-gray-500">{isRTL ? 'رقم الطلب' : 'Order Number'}</p>
                  <p className="font-bold text-rose-600 font-mono">{order.orderNumber}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                  order.status === 'shipped'   ? 'bg-purple-100 text-purple-700' :
                  order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'}`}>
                  {statusSteps.find((s) => s.status === order.status)?.label}
                </span>
              </div>

              {/* Progress */}
              <div className="mb-8">
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-5 left-4 right-4 h-0.5 bg-gray-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentStep + 1) / statusSteps.length) * 100}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="h-full bg-gradient-to-r from-rose-500 to-purple-600"
                    />
                  </div>
                  {statusSteps.map((step, i) => (
                    <div key={step.status} className="flex flex-col items-center gap-2 z-10">
                      <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 + i * 0.1 }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          i <= currentStep ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md' : 'bg-white border-2 border-gray-200 text-gray-300'
                        }`}>
                        <step.icon size={16} />
                      </motion.div>
                      <span className={`text-xs ${i <= currentStep ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {order.trackingNumber && (
                <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100">
                  <p className={`text-sm font-semibold text-blue-700 ${isRTL ? 'text-right' : ''}`}>{isRTL ? 'رقم التتبع' : 'Tracking Number'}</p>
                  <p className={`text-blue-900 font-mono font-bold mt-1 ${isRTL ? 'text-right' : ''}`}>{order.trackingNumber}</p>
                </div>
              )}

              {order.items && (
                <div className="border-t border-gray-100 pt-4">
                  <h4 className={`font-semibold text-gray-800 mb-3 text-sm ${isRTL ? 'text-right' : ''}`}>{isRTL ? 'عناصر الطلب' : 'Order Items'}</h4>
                  <div className="space-y-2">
                    {order.items.map((item: any) => (
                      <div key={item.id} className={`flex justify-between items-center text-sm py-2 border-b border-gray-50 last:border-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="text-gray-700">
                          {item.productTitle} × {item.quantity}
                          <span className="text-gray-400 text-xs ms-2">({item.size} / {item.color})</span>
                        </span>
                        <span className="font-semibold text-gray-900">{(parseFloat(item.priceAtPurchase) * item.quantity).toFixed(3)} JOD</span>
                      </div>
                    ))}
                  </div>
                  <div className={`flex justify-between font-bold text-base pt-3 mt-2 border-t border-gray-200 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
                    <span className="text-rose-600">{parseFloat(order.totalPrice).toFixed(3)} JOD</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
