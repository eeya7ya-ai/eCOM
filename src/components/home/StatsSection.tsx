'use client';
import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

interface StatsSectionProps {
  locale: string;
}

function CountUp({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let startTime: number | null = null;
    let rafId: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [started, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export default function StatsSection({ locale }: StatsSectionProps) {
  const isRTL = locale === 'ar';

  const stats = [
    { value: 500, suffix: '+', label: isRTL ? 'منتجات متاحة' : 'Products Available', emoji: '👗' },
    { value: 1000, suffix: '+', label: isRTL ? 'عميلة سعيدة' : 'Happy Customers', emoji: '💕' },
    { value: 50, suffix: '+', label: isRTL ? 'تصميماً جديداً شهرياً' : 'New Designs Monthly', emoji: '✨' },
    { value: 4, suffix: '.9★', label: isRTL ? 'متوسط التقييم' : 'Average Rating', emoji: '⭐' },
  ];

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="card-glass text-center p-6 rounded-2xl"
          >
            <div className="text-3xl mb-2">{stat.emoji}</div>
            <div className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
              <CountUp end={stat.value} />
              {stat.suffix}
            </div>
            <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
