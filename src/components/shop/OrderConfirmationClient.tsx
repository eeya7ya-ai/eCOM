'use client';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Truck, MapPin, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function OrderConfirmationInner({ locale }: { locale: string }) {
  const isRTL = locale === 'ar';
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const email = searchParams.get('email');

  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 }, colors: ['#f43f5e', '#ec4899', '#a855f7', '#8b5cf6', '#fbbf24'] });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const steps = [
    { icon: CheckCircle, label: isRTL ? 'مؤكد' : 'Confirmed',   done: true },
    { icon: Package,     label: isRTL ? 'قيد التجهيز' : 'Processing', done: false },
    { icon: Truck,       label: isRTL ? 'تم الشحن' : 'Shipped',  done: false },
    { icon: MapPin,      label: isRTL ? 'تم التسليم' : 'Delivered', done: false },
  ];

  return (
    <div className="min-h-screen py-16 flex items-center">
      <div className="max-w-2xl mx-auto px-4 w-full">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 15 }} className="card-glass rounded-3xl p-8 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', damping: 10 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-300/50">
            <CheckCircle size={48} className="text-white" />
          </motion.div>

          <div className="flex justify-center gap-3 text-3xl mb-6">
            {['🎉','💕','✨','🌸','🎀'].map((emoji, i) => (
              <motion.span key={i} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>{emoji}</motion.span>
            ))}
          </div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            {isRTL ? 'تم تأكيد طلبك!' : 'Order Confirmed!'}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-gray-500 mb-8">
            {isRTL ? 'شكراً لتسوقك معنا. نحن نعمل على تجهيز طلبك.' : "Thank you for shopping with us. We're preparing your order."}
          </motion.p>

          {orderNumber && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-rose-50 to-purple-50 rounded-2xl p-5 mb-8 border border-rose-100">
              <p className="text-sm text-gray-500 mb-1">{isRTL ? 'رقم الطلب' : 'Order Number'}</p>
              <p className="text-2xl font-bold text-rose-600 font-mono">{orderNumber}</p>
              {email && <p className="text-xs text-gray-500 mt-2">{isRTL ? `تم إرسال تأكيد إلى ${email}` : `Confirmation sent to ${email}`}</p>}
            </motion.div>
          )}

          {/* Steps */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex items-center justify-between mb-10 relative">
            <div className="absolute top-5 left-8 right-8 h-0.5 bg-gray-200">
              <div className="h-full w-1/4 bg-gradient-to-r from-rose-500 to-purple-600" />
            </div>
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-2 relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s.done ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md' : 'bg-white border-2 border-gray-200 text-gray-300'}`}>
                  <s.icon size={18} />
                </div>
                <span className={`text-xs font-medium ${s.done ? 'text-rose-600' : 'text-gray-400'}`}>{s.label}</span>
              </div>
            ))}
          </motion.div>

          <div className={`flex gap-4 flex-wrap justify-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Link href={`/${locale}/order-tracking`}>
              <motion.button whileHover={{ scale: 1.02 }} className={`btn-primary flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {isRTL ? 'تتبع طلبك' : 'Track Your Order'}
                <ArrowRight size={16} className={isRTL ? 'rotate-180' : ''} />
              </motion.button>
            </Link>
            <Link href={`/${locale}`}>
              <motion.button whileHover={{ scale: 1.02 }} className={`btn-secondary flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Home size={16} />
                {isRTL ? 'الرئيسية' : 'Home'}
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function OrderConfirmationClient({ locale }: { locale: string }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-rose-500">Loading...</div></div>}>
      <OrderConfirmationInner locale={locale} />
    </Suspense>
  );
}
