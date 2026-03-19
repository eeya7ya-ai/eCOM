'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPageClient({ locale }: { locale: string }) {
  const { items, removeItem, updateQuantity, subtotal } = useCartStore();
  const isRTL = locale === 'ar';

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 py-20">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}
          className="w-28 h-28 rounded-full bg-gradient-to-br from-rose-100 to-purple-100 flex items-center justify-center">
          <ShoppingBag size={52} className="text-rose-300" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            {isRTL ? 'سلتك فارغة' : 'Your cart is empty'}
          </h2>
          <p className="text-gray-500 mb-6">{isRTL ? 'ابدئي التسوق وأضيفي عناصر إلى سلتك' : 'Start shopping and add items to your cart'}</p>
          <Link href={`/${locale}/shop`}>
            <button className="btn-primary">{isRTL ? 'تسوقي الآن' : 'Shop Now'}</button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`mb-8 ${isRTL ? 'text-right' : ''}`}>
          <h1 className="section-title text-4xl">{isRTL ? 'سلة التسوق' : 'Shopping Cart'}</h1>
          <p className="text-gray-500 mt-1">{items.length} {isRTL ? 'عنصر' : 'items'}</p>
        </motion.div>

        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${isRTL ? 'lg:grid-flow-dense' : ''}`}>
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: isRTL ? 60 : -60, height: 0 }} transition={{ delay: i * 0.05 }}
                  className={`card-glass rounded-2xl p-4 flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {/* Image */}
                  <div className="relative w-24 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    {item.image
                      ? <Image src={item.image} alt={item.title} fill className="object-cover" />
                      : <div className="w-full h-full bg-gradient-to-br from-rose-100 to-purple-100" />}
                  </div>

                  {/* Info */}
                  <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : ''}`}>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {isRTL ? item.titleAr || item.title : item.title}
                    </h3>
                    <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                      <span className="text-xs bg-gray-100 rounded-lg px-2 py-0.5 font-medium">{item.size}</span>
                      <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: item.colorCode || item.color }} />
                      <span className="text-xs text-gray-500">{item.color}</span>
                    </div>
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {/* Quantity */}
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-rose-400 transition-colors">
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, Math.min(item.quantity + 1, item.maxQuantity))}
                          className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-rose-400 transition-colors">
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="font-bold text-rose-600">{formatPrice(item.price * item.quantity, locale)}</span>
                        <button onClick={() => removeItem(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <Link href={`/${locale}/shop`}>
              <button className={`flex items-center gap-2 text-gray-500 hover:text-rose-600 transition-colors text-sm mt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <ArrowLeft size={16} className={isRTL ? 'rotate-180' : ''} />
                {isRTL ? 'مواصلة التسوق' : 'Continue Shopping'}
              </button>
            </Link>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="card-glass rounded-2xl p-6 sticky top-24">
              <h2 className={`font-bold text-xl text-gray-900 mb-6 ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'ملخص الطلب' : 'Order Summary'}
              </h2>
              <div className="space-y-3 mb-6">
                <div className={`flex justify-between text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>{isRTL ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span className="font-medium">{formatPrice(subtotal(), locale)}</span>
                </div>
                <div className={`flex justify-between text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>{isRTL ? 'الشحن' : 'Shipping'}</span>
                  <span className="text-sm text-gray-400">{isRTL ? 'يُحسب عند الدفع' : 'Calculated at checkout'}</span>
                </div>
                <div className={`flex justify-between font-bold text-xl pt-3 border-t border-gray-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
                  <span className="text-rose-600">{formatPrice(subtotal(), locale)}</span>
                </div>
              </div>

              <Link href={`/${locale}/checkout`}>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className={`btn-primary w-full py-4 flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {isRTL ? 'إتمام الشراء' : 'Proceed to Checkout'}
                  <ArrowRight size={18} className={isRTL ? 'rotate-180' : ''} />
                </motion.button>
              </Link>

              {/* Trust badges */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { icon: '🔒', text: isRTL ? 'دفع آمن' : 'Secure Pay' },
                  { icon: '↩️', text: isRTL ? 'إرجاع سهل' : 'Easy Returns' },
                  { icon: '🚚', text: isRTL ? 'شحن سريع' : 'Fast Delivery' },
                ].map((badge) => (
                  <div key={badge.text} className="text-center p-2 bg-gray-50 rounded-xl">
                    <div className="text-lg">{badge.icon}</div>
                    <p className="text-xs text-gray-500 mt-0.5">{badge.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
