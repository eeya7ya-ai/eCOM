'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingCart, Truck, Tag,
  LogOut, Menu, X, Lock, Eye, EyeOff, ChevronRight
} from 'lucide-react';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  locale: string;
}

export default function AdminLayoutClient({ children, locale }: AdminLayoutClientProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const isRTL = locale === 'ar';

  useEffect(() => {
    const auth = sessionStorage.getItem('admin-auth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'admin123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin-auth', 'true');
      setError('');
    } else {
      setError(isRTL ? 'كلمة المرور غير صحيحة' : 'Incorrect password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin-auth');
    setPassword('');
  };

  const navLinks = [
    { href: `/${locale}/admin/dashboard`, icon: LayoutDashboard, label: isRTL ? 'لوحة التحكم' : 'Dashboard' },
    { href: `/${locale}/admin/products`, icon: Package, label: isRTL ? 'المنتجات' : 'Products' },
    { href: `/${locale}/admin/orders`, icon: ShoppingCart, label: isRTL ? 'الطلبات' : 'Orders' },
    { href: `/${locale}/admin/shipping`, icon: Truck, label: isRTL ? 'الشحن' : 'Shipping' },
    { href: `/${locale}/admin/categories`, icon: Tag, label: isRTL ? 'الفئات' : 'Categories' },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-glass rounded-3xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Lock size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              {isRTL ? 'لوحة الإدارة' : 'Admin Panel'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {isRTL ? 'أدخل كلمة المرور للدخول' : 'Enter password to continue'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRTL ? 'كلمة المرور' : 'Password'}
                className={`input-field ${isRTL ? 'pr-4 pl-12 text-right' : 'pl-4 pr-12'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} text-gray-400 hover:text-gray-600`}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" className="btn-primary w-full py-3.5">
              {isRTL ? 'تسجيل الدخول' : 'Login'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            {isRTL ? 'كلمة المرور الافتراضية: admin123' : 'Default password: admin123'}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen ${isRTL ? 'flex-row-reverse' : ''}`}>
      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen) && (
          <motion.aside
            initial={{ x: isRTL ? 300 : -300 }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? 300 : -300 }}
            className="fixed top-0 bottom-0 z-40 w-64 glass-dark shadow-2xl flex flex-col"
            style={{ [isRTL ? 'right' : 'left']: 0 }}
          >
            {/* Logo */}
            <div className="p-6 border-b border-white/10">
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">L</span>
                </div>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-white font-bold text-sm">LUMIÈRE</p>
                  <p className="text-gray-400 text-xs">{isRTL ? 'الإدارة' : 'Admin Panel'}</p>
                </div>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 p-4 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                return (
                  <Link key={link.href} href={link.href}>
                    <motion.div
                      whileHover={{ x: isRTL ? -4 : 4 }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isRTL ? 'flex-row-reverse' : ''} ${
                        isActive
                          ? 'bg-gradient-to-r from-rose-500/20 to-purple-600/20 text-white border border-rose-500/30'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <link.icon size={18} />
                      <span className="text-sm font-medium">{link.label}</span>
                      {isActive && <ChevronRight size={14} className={`ms-auto ${isRTL ? 'rotate-180' : ''}`} />}
                    </motion.div>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom */}
            <div className="p-4 border-t border-white/10">
              <Link href={`/${locale}`}>
                <div className={`flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white text-sm mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>🏠</span>
                  {isRTL ? 'عرض المتجر' : 'View Store'}
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className={`flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-sm ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <LogOut size={16} />
                {isRTL ? 'تسجيل الخروج' : 'Logout'}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? (isRTL ? 'mr-64' : 'ml-64') : ''}`}>
        {/* Top Bar */}
        <div className="sticky top-16 z-30 glass border-b border-white/30 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-purple-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <span className="text-sm font-medium text-gray-700">Admin</span>
          </div>
        </div>

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
