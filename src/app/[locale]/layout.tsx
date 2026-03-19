import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import StoreHydration from '@/components/providers/StoreHydration';

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
    <div dir={dir} className={locale === 'ar' ? 'font-arabic' : ''}>
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
    </div>
  );
}
