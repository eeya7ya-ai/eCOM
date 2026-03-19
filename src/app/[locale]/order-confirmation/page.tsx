export const dynamic = 'force-dynamic';
import OrderConfirmationClient from '@/components/shop/OrderConfirmationClient';

export default function OrderConfirmationPage({ params: { locale } }: { params: { locale: string } }) {
  return <OrderConfirmationClient locale={locale} />;
}
