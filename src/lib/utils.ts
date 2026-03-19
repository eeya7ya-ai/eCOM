import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string, locale: string = 'en'): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  const formatted = num.toFixed(3);
  return locale === 'ar' ? `${formatted} د.أ` : `${formatted} JOD`;
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export const GOVERNORATES = [
  { en: 'Amman', ar: 'عمان' },
  { en: 'Zarqa', ar: 'الزرقاء' },
  { en: 'Irbid', ar: 'إربد' },
  { en: 'Aqaba', ar: 'العقبة' },
  { en: 'Jerash', ar: 'جرش' },
  { en: 'Mafraq', ar: 'المفرق' },
  { en: 'Balqa', ar: 'البلقاء' },
  { en: 'Madaba', ar: 'مادبا' },
  { en: 'Karak', ar: 'الكرك' },
  { en: 'Tafilah', ar: 'الطفيلة' },
  { en: 'Maan', ar: 'معان' },
  { en: 'Ajloun', ar: 'عجلون' },
];
