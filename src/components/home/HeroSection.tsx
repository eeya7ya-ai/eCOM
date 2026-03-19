'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Star } from 'lucide-react';

interface HeroProps {
  locale: string;
}

const slides = [
  {
    gradient: 'from-rose-400 via-pink-500 to-purple-600',
    bg: 'from-rose-50 via-pink-50 to-purple-50',
    titleEn: 'Elegance\nRedefined',
    titleAr: 'أناقة\nبلا حدود',
    subtitleEn: 'Discover the latest women\'s fashion collection',
    subtitleAr: 'اكتشفي أحدث مجموعات الأزياء النسائية',
    tag: '✨ New Season 2024',
    tagAr: '✨ موسم جديد 2024',
  },
  {
    gradient: 'from-violet-500 via-purple-500 to-pink-500',
    bg: 'from-violet-50 via-purple-50 to-pink-50',
    titleEn: 'Fashion\nForward',
    titleAr: 'موضة\nعصرية',
    subtitleEn: 'Shop the latest dresses & accessories in Jordan',
    subtitleAr: 'تسوقي أحدث الفساتين والإكسسوارات في الأردن',
    tag: '🌹 New Arrivals',
    tagAr: '🌹 وصولات جديدة',
  },
  {
    gradient: 'from-amber-400 via-rose-500 to-pink-600',
    bg: 'from-amber-50 via-rose-50 to-pink-50',
    titleEn: 'Express\nYourself',
    titleAr: 'عبّري\nعن نفسك',
    subtitleEn: 'Curated styles for every occasion',
    subtitleAr: 'أساليب مختارة لكل مناسبة',
    tag: '💫 Free Shipping over 50 JOD',
    tagAr: '💫 شحن مجاني فوق 50 د.أ',
  },
];

export default function HeroSection({ locale }: HeroProps) {
  const [current, setCurrent] = useState(0);
  const [particles, setParticles] = useState<Array<{ x: number; y: number; size: number; delay: number; color: string }>>([]);
  const isRTL = locale === 'ar';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setParticles(
      [...Array(5)].map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 6 + 3,
        delay: Math.random() * 5,
        color: ['#f472b6', '#a78bfa', '#fbbf24', '#fb7185', '#c084fc'][Math.floor(Math.random() * 5)],
      }))
    );
  }, []);

  const slide = slides[current];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Animated Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className={`absolute inset-0 bg-gradient-to-br ${slide.bg}`}
        />
      </AnimatePresence>

      {/* Floating Particles - CSS only */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-float opacity-60"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${4 + p.delay}s`,
          }}
        />
      ))}

      {/* Large decorative circles - static, no continuous animation */}
      <div
        className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #f472b6, transparent)' }}
      />
      <div
        className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }}
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-screen py-20">
          {/* Text Side */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${current}`}
              initial={{ opacity: 0, x: isRTL ? 60 : -60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? -60 : 60 }}
              transition={{ duration: 0.8 }}
              className={isRTL ? 'text-right order-2 lg:order-2' : 'text-left order-2 lg:order-1'}
            >
              {/* Tag */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 shadow-md text-sm font-semibold text-gray-700 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <Sparkles size={14} className="text-rose-500" />
                {isRTL ? slide.tagAr : slide.tag}
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`text-6xl sm:text-7xl lg:text-8xl font-bold leading-[0.9] mb-6 bg-gradient-to-r ${slide.gradient} bg-clip-text text-transparent whitespace-pre-line`}
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {isRTL ? slide.titleAr : slide.titleEn}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-gray-600 mb-10 max-w-md leading-relaxed"
              >
                {isRTL ? slide.subtitleAr : slide.subtitleEn}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`flex items-center gap-4 flex-wrap ${isRTL ? 'flex-row-reverse justify-end' : ''}`}
              >
                <Link href={`/${locale}/shop`}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`btn-primary flex items-center gap-2 text-base px-8 py-4 shadow-xl shadow-rose-300/50 ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    {isRTL ? 'تسوقي الآن' : 'Shop Now'}
                    <ArrowRight size={18} className={isRTL ? 'rotate-180' : ''} />
                  </motion.button>
                </Link>
                <Link href={`/${locale}/shop?filter=new`}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-secondary text-base px-8 py-4"
                  >
                    {isRTL ? 'الوصولات الجديدة' : 'New Arrivals'}
                  </motion.button>
                </Link>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className={`flex items-center gap-6 mt-10 flex-wrap ${isRTL ? 'flex-row-reverse justify-end' : ''}`}
              >
                {[
                  { icon: '🚚', text: isRTL ? 'شحن مجاني' : 'Free Shipping', sub: isRTL ? 'فوق 50 د.أ' : 'Over 50 JOD' },
                  { icon: '↩️', text: isRTL ? 'إرجاع سهل' : 'Easy Returns', sub: isRTL ? '14 يوم' : '14 Days' },
                  { icon: '🔒', text: isRTL ? 'دفع آمن' : 'Secure Pay', sub: isRTL ? 'مشفر 100%' : '100% Secure' },
                ].map((badge, i) => (
                  <div key={i} className={`flex items-center gap-2 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-2xl">{badge.icon}</span>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <p className="font-semibold text-gray-800 text-xs">{badge.text}</p>
                      <p className="text-gray-500 text-xs">{badge.sub}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Visual Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className={`relative ${isRTL ? 'order-1 lg:order-1' : 'order-1 lg:order-2'}`}
          >
            {/* Main visual */}
            <div className="relative mx-auto w-80 h-96 sm:w-96 sm:h-[500px]">
              {/* Decorative rings - static */}
              {[1, 2, 3].map((ring) => (
                <div
                  key={ring}
                  className="absolute inset-0 rounded-full border-2 border-dashed opacity-20"
                  style={{
                    borderColor: ring === 1 ? '#f472b6' : ring === 2 ? '#a78bfa' : '#fbbf24',
                    inset: `${(ring - 1) * 20}px`,
                  }}
                />
              ))}

              {/* Central card */}
              <div
                className="absolute inset-8 rounded-3xl overflow-hidden shadow-2xl animate-float"
              >
                <div className={`w-full h-full bg-gradient-to-br ${slide.gradient} flex items-center justify-center`}>
                  <div className="text-center text-white p-8">
                    <div className="text-8xl mb-4">👗</div>
                    <p className="text-xl font-semibold" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {isRTL ? 'موضة راقية' : 'Fashion & Style'}
                    </p>
                    <p className="text-sm opacity-80 mt-2">
                      {isRTL ? 'أحدث التصاميم' : 'Latest Designs 2024'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              {[
                { text: isRTL ? '٢٠٠+ تصميم' : '200+ Styles', pos: 'top-4 -left-8', delay: 0 },
                { text: isRTL ? 'توصيل سريع' : 'Fast Delivery', pos: 'bottom-16 -right-8', delay: 0.5 },
                { text: isRTL ? 'جودة فاخرة' : 'Premium Quality', pos: 'top-1/2 -right-12', delay: 1 },
              ].map((badge, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + badge.delay }}
                  className={`absolute ${badge.pos} glass rounded-2xl px-4 py-2 shadow-xl text-xs font-semibold text-gray-800 whitespace-nowrap`}
                >
                  <div className="flex items-center gap-1">
                    <Star size={10} className="text-amber-400 fill-amber-400" />
                    {badge.text}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current
                ? 'w-8 h-3 bg-gradient-to-r from-rose-500 to-purple-600'
                : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 right-8 flex flex-col items-center gap-1 text-gray-400 animate-float"
      >
        <p className="text-xs uppercase tracking-widest" style={{ writingMode: 'vertical-rl' }}>
          {isRTL ? 'تمرير' : 'Scroll'}
        </p>
        <div className="w-px h-10 bg-gradient-to-b from-gray-400 to-transparent" />
      </div>
    </section>
  );
}
