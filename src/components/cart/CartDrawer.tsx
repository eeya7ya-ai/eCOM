'use client';
import { useCartStore } from '@/store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { useParams } from 'next/navigation';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } = useCartStore();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const isRTL = locale === 'ar';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: isRTL ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? '-100%' : '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} h-full w-full sm:w-[420px] z-[80] flex flex-col`}
            style={{ background: 'rgba(255,255,255,0.98)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 flex items-center justify-center">
                  <ShoppingBag size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {isRTL ? 'سلة التسوق' : 'Shopping Cart'}
                  </h2>
                  <p className="text-xs text-gray-500">{items.length} {isRTL ? 'عنصر' : 'items'}</p>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center">
                    <ShoppingBag size={32} className="text-rose-300" />
                  </div>
                  <p className="text-gray-500 font-medium">
                    {isRTL ? 'سلتك فارغة' : 'Your cart is empty'}
                  </p>
                  <button
                    onClick={closeCart}
                    className="btn-primary text-sm px-6 py-2.5"
                  >
                    {isRTL ? 'تسوقي الآن' : 'Start Shopping'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        className="flex gap-4 p-3 bg-gray-50 rounded-2xl"
                      >
                        {/* Image */}
                        <div className="relative w-20 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-rose-100 to-purple-100" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm truncate">
                            {isRTL ? item.titleAr || item.title : item.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500 bg-white rounded-lg px-2 py-0.5 border">
                              {item.size}
                            </span>
                            <div
                              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: item.colorCode || item.color }}
                            />
                          </div>
                          <p className="font-bold text-rose-600 mt-2 text-sm">
                            {formatPrice(item.price * item.quantity, locale)}
                          </p>

                          {/* Quantity */}
                          <div className={`flex items-center gap-2 mt-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 rounded-full bg-white shadow-sm border flex items-center justify-center hover:border-rose-300 transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, Math.min(item.quantity + 1, item.maxQuantity))}
                              className="w-7 h-7 rounded-full bg-white shadow-sm border flex items-center justify-center hover:border-rose-300 transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="self-start p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-gray-100 space-y-4">
                <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-gray-600 font-medium">
                    {isRTL ? 'المجموع الفرعي' : 'Subtotal'}
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatPrice(subtotal(), locale)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 text-center">
                  {isRTL ? 'الشحن يُحسب عند الدفع' : 'Shipping calculated at checkout'}
                </p>
                <Link href={`/${locale}/checkout`} onClick={closeCart}>
                  <button className="btn-primary w-full flex items-center justify-center gap-2 py-4">
                    {isRTL ? 'إتمام الشراء' : 'Proceed to Checkout'}
                    <ArrowRight size={18} className={isRTL ? 'rotate-180' : ''} />
                  </button>
                </Link>
                <button
                  onClick={closeCart}
                  className="w-full text-center text-sm text-gray-500 hover:text-rose-600 transition-colors py-2"
                >
                  {isRTL ? 'مواصلة التسوق' : 'Continue Shopping'}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
