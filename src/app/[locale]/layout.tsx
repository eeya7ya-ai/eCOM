import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import '../globals.css';

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
    <html lang={locale} dir={dir}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&family=Noto+Kufi+Arabic:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`min-h-screen bg-white ${locale === 'ar' ? 'font-arabic' : 'font-sans'}`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
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
