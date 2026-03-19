export const dynamic = 'force-dynamic';
import CartPageClient from '@/components/cart/CartPageClient';

export default function CartPage({ params: { locale } }: { params: { locale: string } }) {
  return <CartPageClient locale={locale} />;
}
