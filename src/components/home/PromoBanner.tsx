'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Tag } from 'lucide-react';

interface PromoBannerProps {
  locale: string;
}

export default function PromoBanner({ locale }: PromoBannerProps) {
  const isRTL = locale === 'ar';

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl"
        style={{
          background: 'linear-gradient(-45deg, #f43f5e, #ec4899, #a855f7, #8b5cf6)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 8s ease infinite',
        }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -30, 0],
                x: [0, 15, -15, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.5 }}
              className="absolute text-4xl select-none"
              style={{
                left: `${10 + i * 12}%`,
                top: `${10 + (i % 3) * 30}%`,
              }}
            >
              {['✨', '🌸', '💫', '🌟', '💎', '🌺', '💜', '🎀'][i]}
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 px-8 sm:px-12 py-12 sm:py-16">
          <div className={`flex flex-col sm:flex-row items-center justify-between gap-8 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <div className={isRTL ? 'text-right sm:text-right' : 'text-center sm:text-left'}>
              <div className={`inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Tag size={14} className="text-white" />
                <span className="text-white text-sm font-semibold">
                  {isRTL ? 'عرض محدود' : 'Limited Offer'}
                </span>
              </div>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {isRTL ? 'شحن مجاني' : 'Free Shipping'}
              </h2>
              <p className="text-white/90 text-lg">
                {isRTL ? 'على جميع الطلبات فوق 50 دينار أردني' : 'On all orders above 50 JOD'}
              </p>
            </div>

            <Link href={`/${locale}/shop`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-3 bg-white text-purple-700 font-bold px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                {isRTL ? 'تسوقي الآن' : 'Shop Now'}
                <ArrowRight size={20} className={isRTL ? 'rotate-180' : ''} />
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
