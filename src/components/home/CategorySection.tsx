'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface Category {
  id: number;
  slug: string;
  translations: Array<{ language: string; name: string }>;
}

interface CategorySectionProps {
  categories: Category[];
  locale: string;
}

const categoryConfig = {
  dresses: {
    emoji: '👗',
    gradient: 'from-rose-400 to-pink-600',
    bg: 'from-rose-50 to-pink-100',
    hoverBg: 'group-hover:from-rose-100 group-hover:to-pink-200',
  },
  clothes: {
    emoji: '🧥',
    gradient: 'from-purple-400 to-violet-600',
    bg: 'from-purple-50 to-violet-100',
    hoverBg: 'group-hover:from-purple-100 group-hover:to-violet-200',
  },
  accessories: {
    emoji: '👜',
    gradient: 'from-amber-400 to-orange-500',
    bg: 'from-amber-50 to-orange-100',
    hoverBg: 'group-hover:from-amber-100 group-hover:to-orange-200',
  },
};

export default function CategorySection({ categories, locale }: CategorySectionProps) {
  const isRTL = locale === 'ar';

  const displayCategories = categories.length > 0 ? categories : [
    { id: 1, slug: 'dresses', translations: [{ language: 'en', name: 'Dresses' }, { language: 'ar', name: 'فساتين' }] },
    { id: 2, slug: 'clothes', translations: [{ language: 'en', name: 'Clothes' }, { language: 'ar', name: 'ملابس' }] },
    { id: 3, slug: 'accessories', translations: [{ language: 'en', name: 'Accessories' }, { language: 'ar', name: 'إكسسوارات' }] },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`text-center mb-14`}
      >
        <p className="text-rose-500 font-semibold text-sm uppercase tracking-widest mb-3">
          {isRTL ? 'تصفح حسب' : 'Browse By'}
        </p>
        <h2 className="section-title">
          {isRTL ? 'تسوقي حسب الفئة' : 'Shop by Category'}
        </h2>
        <p className="section-subtitle mt-3">
          {isRTL ? 'اعثري على ما تبحثين عنه بسهولة' : 'Find exactly what you\'re looking for'}
        </p>
      </motion.div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {displayCategories.map((category, index) => {
          const config = categoryConfig[category.slug as keyof typeof categoryConfig] || categoryConfig.dresses;
          const translation = category.translations.find((t) => t.language === locale)
            || category.translations[0];

          const descriptions: Record<string, { en: string; ar: string }> = {
            dresses: { en: 'Elegant designs for every occasion', ar: 'تصاميم أنيقة لكل مناسبة' },
            clothes: { en: 'Trendy styles for everyday wear', ar: 'أساليب عصرية للارتداء اليومي' },
            accessories: { en: 'Complete your perfect look', ar: 'أكملي إطلالتك المثالية' },
          };

          const desc = descriptions[category.slug] || descriptions.dresses;

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
            >
              <Link href={`/${locale}/shop?category=${category.slug}`}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${config.bg} ${config.hoverBg} transition-all duration-500 shadow-lg hover:shadow-2xl cursor-pointer h-72`}
                >
                  {/* Background decoration */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                    className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full opacity-20"
                    style={{ background: `linear-gradient(135deg, transparent, currentColor)` }}
                  />

                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                    {/* Emoji */}
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: index * 0.5 }}
                      className="text-7xl mb-5 drop-shadow-lg"
                    >
                      {config.emoji}
                    </motion.div>

                    {/* Category name */}
                    <h3
                      className={`text-2xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent mb-2`}
                      style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                      {translation?.name}
                    </h3>

                    <p className="text-gray-500 text-sm text-center">
                      {isRTL ? desc.ar : desc.en}
                    </p>

                    {/* CTA */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      className={`flex items-center gap-2 mt-5 font-semibold text-sm bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent group-hover:gap-3 transition-all duration-300`}
                    >
                      {isRTL ? 'تسوقي الآن' : 'Shop Now'}
                      <ArrowRight
                        size={16}
                        className={`text-current transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`}
                      />
                    </motion.div>
                  </div>

                  {/* Hover overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
