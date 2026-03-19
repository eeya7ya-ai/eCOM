'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, Search, Heart, Globe } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

interface NavbarProps {
  locale: string;
}

export default function Navbar({ locale }: NavbarProps) {
  const t = useTranslations('nav');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems, openCart } = useCartStore();
  const pathname = usePathname();
  const router = useRouter();
  const isRTL = locale === 'ar';

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const switchLocale = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  const navLinks = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/shop`, label: t('shop') },
    { href: `/${locale}/shop?category=dresses`, label: t('dresses') },
    { href: `/${locale}/shop?category=clothes`, label: t('clothes') },
    { href: `/${locale}/shop?category=accessories`, label: t('accessories') },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${locale}/shop?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'glass shadow-lg shadow-rose-100/50 py-2'
            : 'bg-white/70 backdrop-blur-sm py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs font-bold">L</span>
                </div>
                <span
                  className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  LUMIÈRE
                </span>
              </motion.div>
            </Link>

            {/* Desktop Nav Links */}
            <div className={`hidden md:flex items-center gap-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {navLinks.slice(0, 2).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-rose-600 font-medium transition-colors duration-200 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-500 to-purple-600 group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
              {/* Categories Dropdown */}
              <div className="relative group">
                <button className="text-gray-700 hover:text-rose-600 font-medium transition-colors duration-200 flex items-center gap-1">
                  {t('categories')}
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`absolute top-full ${isRTL ? 'right-0' : 'left-0'} mt-2 w-48 glass rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 overflow-hidden`}>
                  {navLinks.slice(2).map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-5 py-3 text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors duration-200 text-sm font-medium"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {/* Search */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-600 hover:text-rose-600 transition-colors duration-200 rounded-full hover:bg-rose-50"
              >
                <Search size={20} />
              </motion.button>

              {/* Wishlist */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-gray-600 hover:text-rose-600 transition-colors duration-200 rounded-full hover:bg-rose-50 hidden sm:flex"
              >
                <Heart size={20} />
              </motion.button>

              {/* Cart */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={openCart}
                className="relative p-2 text-gray-600 hover:text-rose-600 transition-colors duration-200 rounded-full hover:bg-rose-50"
              >
                <ShoppingBag size={20} />
                <AnimatePresence>
                  {totalItems() > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-rose-500 to-purple-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-md"
                    >
                      {totalItems()}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Language Switcher */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={switchLocale}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all duration-200 text-sm font-semibold"
              >
                <Globe size={14} />
                {t('language')}
              </motion.button>

              {/* Mobile Menu */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-rose-600 transition-colors duration-200"
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass border-t border-white/50 mt-2"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-gray-700 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200 font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-32"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: -20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4"
            >
              <form onSubmit={handleSearch} className="flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={locale === 'ar' ? 'ابحثي عن منتجات...' : 'Search products...'}
                  className="input-field flex-1"
                  autoFocus
                />
                <button type="submit" className="btn-primary px-6 py-3">
                  <Search size={20} />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
