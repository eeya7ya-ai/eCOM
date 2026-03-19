export const dynamic = 'force-dynamic';
import OrderTrackingClient from '@/components/shop/OrderTrackingClient';

export default function OrderTrackingPage({ params: { locale } }: { params: { locale: string } }) {
  return <OrderTrackingClient locale={locale} />;
}
