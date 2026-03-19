export interface Product {
  id: number;
  slug: string;
  price: string;
  categoryId: number | null;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  createdAt: Date;
  translations: ProductTranslation[];
  images: ProductImage[];
  variants: ProductVariant[];
  category?: Category;
}

export interface ProductTranslation {
  id: number;
  productId: number;
  language: string;
  title: string;
  description: string | null;
}

export interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  displayOrder: number;
}

export interface ProductVariant {
  id: number;
  productId: number;
  size: string;
  color: string;
  colorCode: string | null;
  stockQuantity: number;
}

export interface Category {
  id: number;
  slug: string;
  translations: CategoryTranslation[];
}

export interface CategoryTranslation {
  id: number;
  categoryId: number;
  language: string;
  name: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  totalPrice: string;
  shippingCost: string;
  status: string;
  trackingNumber: string | null;
  stripePaymentIntentId: string | null;
  shippingZoneId: number | null;
  createdAt: Date;
  items?: OrderItem[];
  address?: Address;
  shippingZone?: ShippingZone;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  variantId: number | null;
  quantity: number;
  priceAtPurchase: string;
  productTitle: string | null;
  size: string | null;
  color: string | null;
  imageUrl: string | null;
}

export interface Address {
  id: number;
  orderId: number;
  street: string;
  city: string;
  governorate: string;
  postalCode: string | null;
}

export interface ShippingZone {
  id: number;
  zoneName: string;
  zoneNameAr: string | null;
  price: string;
  freeThreshold: string | null;
  estimatedDays: number;
}
