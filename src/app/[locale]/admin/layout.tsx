import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export default function AdminLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return <AdminLayoutClient locale={locale}>{children}</AdminLayoutClient>;
}
