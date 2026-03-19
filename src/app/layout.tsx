import type { Metadata } from 'next';
import { Inter, Playfair_Display, Noto_Kufi_Arabic } from 'next/font/google';
import './globals.css';

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfairDisplay.variable} ${notoKufiArabic.variable}`}>
      <body className="min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
