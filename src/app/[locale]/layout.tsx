import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter, Playfair_Display, Noto_Kufi_Arabic } from 'next/font/google';
import { locales } from '@/i18n';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import StoreHydration from '@/components/providers/StoreHydration';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair-display',
  display: 'swap',
});

const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-noto-kufi-arabic',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LUMIÈRE - Women\'s Fashion',
  description: 'Discover the latest women\'s fashion collection - Dresses, Clothes & Accessories',
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as 'en' | 'ar')) notFound();

  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className={`${inter.variable} ${playfairDisplay.variable} ${notoKufiArabic.variable}`}>
      <body
        className={`min-h-screen ${locale === 'ar' ? 'font-arabic' : 'font-sans'}`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <StoreHydration />
          <Navbar locale={locale} />
          <CartDrawer />
          <main className="pt-16">{children}</main>
          <Footer locale={locale} />
          <Toaster
            position={locale === 'ar' ? 'top-left' : 'top-right'}
            toastOptions={{
              style: {
                background: '#1a1a2e',
                color: '#fff',
                borderRadius: '12px',
              },
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
