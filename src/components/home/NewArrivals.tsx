'use client';
import { motion } from 'framer-motion';
import ProductCard from '@/components/ui/ProductCard';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

interface NewArrivalsProps {
  products: any[];
  locale: string;
}

export default function NewArrivals({ products, locale }: NewArrivalsProps) {
  const isRTL = locale === 'ar';

  if (!products.length) return null;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`flex items-end justify-between mb-12 ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
            <Sparkles size={16} className="text-amber-500" />
            <p className="text-amber-500 font-semibold text-sm uppercase tracking-widest">
              {isRTL ? 'وصل حديثاً' : 'Just Arrived'}
            </p>
          </div>
          <h2 className="section-title">
            {isRTL ? 'الوصولات الجديدة' : 'New Arrivals'}
          </h2>
        </div>
        <Link href={`/${locale}/shop?filter=new`}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className={`hidden sm:flex items-center gap-2 text-rose-600 font-semibold hover:gap-3 transition-all ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            {isRTL ? 'عرض الكل' : 'View All'}
            <ArrowRight size={16} className={isRTL ? 'rotate-180' : ''} />
          </motion.button>
        </Link>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} locale={locale} index={i} />
        ))}
      </div>
    </section>
  );
}
