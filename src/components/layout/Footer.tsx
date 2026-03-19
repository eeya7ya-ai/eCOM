'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, Heart } from 'lucide-react';

interface FooterProps {
  locale: string;
}

export default function Footer({ locale }: FooterProps) {
  const t = useTranslations('footer');
  const isRTL = locale === 'ar';

  return (
    <footer className="relative overflow-hidden mt-20">
      {/* Gradient top border */}
      <div className="h-px bg-gradient-to-r from-rose-300 via-purple-400 to-pink-300" />

      {/* Background */}
      <div className="bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 text-white">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                background: i % 2 === 0 ? 'rgba(244,114,182,0.4)' : 'rgba(167,139,250,0.4)',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.8}s`,
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className={`grid grid-cols-1 md:grid-cols-4 gap-10 ${isRTL ? 'text-right' : 'text-left'}`}>
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4" style={{ justifyContent: isRTL ? 'flex-end' : 'flex-start' }}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">L</span>
                </div>
                <span
                  className="text-2xl font-bold text-white"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  LUMIÈRE
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">{t('description')}</p>
              {/* Social Links */}
              <div className={`flex gap-3 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                {[
                  { icon: Instagram, color: 'hover:text-pink-400' },
                  { icon: Facebook, color: 'hover:text-blue-400' },
                  { icon: Twitter, color: 'hover:text-sky-400' },
                ].map(({ icon: Icon, color }, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    whileHover={{ scale: 1.2, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-gray-400 ${color} transition-colors duration-200 hover:bg-white/20`}
                  >
                    <Icon size={16} />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">{t('quickLinks')}</h3>
              <ul className="space-y-3">
                {[
                  { href: `/${locale}`, label: locale === 'ar' ? 'الرئيسية' : 'Home' },
                  { href: `/${locale}/shop`, label: locale === 'ar' ? 'المتجر' : 'Shop' },
                  { href: `/${locale}/shop?category=dresses`, label: locale === 'ar' ? 'فساتين' : 'Dresses' },
                  { href: `/${locale}/shop?category=clothes`, label: locale === 'ar' ? 'ملابس' : 'Clothes' },
                  { href: `/${locale}/shop?category=accessories`, label: locale === 'ar' ? 'إكسسوارات' : 'Accessories' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-rose-400 text-sm transition-colors duration-200 flex items-center gap-2 group"
                      style={{ justifyContent: isRTL ? 'flex-end' : 'flex-start' }}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full bg-rose-500 opacity-0 group-hover:opacity-100 transition-opacity ${isRTL ? 'order-last' : 'order-first'}`} />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">{t('customerService')}</h3>
              <ul className="space-y-3">
                {[
                  { href: `/${locale}/order-tracking`, label: t('trackOrder') },
                  { href: '#', label: t('returns') },
                  { href: '#', label: t('faq') },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-rose-400 text-sm transition-colors duration-200 flex items-center gap-2 group"
                      style={{ justifyContent: isRTL ? 'flex-end' : 'flex-start' }}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full bg-rose-500 opacity-0 group-hover:opacity-100 transition-opacity ${isRTL ? 'order-last' : 'order-first'}`} />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">{t('contactUs')}</h3>
              <ul className="space-y-3">
                {[
                  { icon: Mail, text: 'hello@lumiere.jo' },
                  { icon: Phone, text: '+962 6 000 0000' },
                  { icon: MapPin, text: locale === 'ar' ? 'عمان، الأردن' : 'Amman, Jordan' },
                ].map(({ icon: Icon, text }, i) => (
                  <li key={i} className={`flex items-center gap-3 text-gray-400 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Icon size={14} className="text-rose-400 flex-shrink-0" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm flex items-center gap-2">
              © 2024 LUMIÈRE. {t('rights')}
              <Heart size={12} className="text-rose-500 animate-pulse" />
            </p>
            <div className="flex items-center gap-4">
              <Image src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" width={40} height={24} className="h-6 w-auto opacity-60 hover:opacity-100 transition-opacity" />
              <Image src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" width={40} height={24} className="h-6 w-auto opacity-60 hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-1 text-gray-500 text-xs">
                <span>Powered by</span>
                <span className="text-purple-400 font-semibold">Stripe</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
