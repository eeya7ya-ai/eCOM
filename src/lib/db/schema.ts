import { pgTable, serial, varchar, text, decimal, integer, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const orderStatusEnum = pgEnum('order_status', ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']);
export const languageEnum = pgEnum('language', ['ar', 'en']);
export const sizeEnum = pgEnum('size', ['XS', 'S', 'M', 'L', 'XL', 'XXL']);

// Categories
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const categoryTranslations = pgTable('category_translations', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'cascade' }).notNull(),
  language: varchar('language', { length: 5 }).notNull(),
  name: varchar('name', { length: 200 }).notNull(),
});

// Products
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  price: decimal('price', { precision: 10, scale: 3 }).notNull(),
  categoryId: integer('category_id').references(() => categories.id),
  isActive: boolean('is_active').default(true).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  isNewArrival: boolean('is_new_arrival').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const productTranslations = pgTable('product_translations', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  language: varchar('language', { length: 5 }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
});

export const productImages = pgTable('product_images', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  imageUrl: text('image_url').notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
});

export const productVariants = pgTable('product_variants', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  size: varchar('size', { length: 10 }).notNull(),
  color: varchar('color', { length: 50 }).notNull(),
  colorCode: varchar('color_code', { length: 10 }),
  stockQuantity: integer('stock_quantity').default(0).notNull(),
});

// Orders
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
  customerName: varchar('customer_name', { length: 200 }).notNull(),
  customerEmail: varchar('customer_email', { length: 300 }).notNull(),
  customerPhone: varchar('customer_phone', { length: 50 }),
  totalPrice: decimal('total_price', { precision: 10, scale: 3 }).notNull(),
  shippingCost: decimal('shipping_cost', { precision: 10, scale: 3 }).default('0').notNull(),
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  trackingNumber: varchar('tracking_number', { length: 100 }),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 200 }),
  shippingZoneId: integer('shipping_zone_id').references(() => shippingZones.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  variantId: integer('variant_id').references(() => productVariants.id),
  quantity: integer('quantity').notNull(),
  priceAtPurchase: decimal('price_at_purchase', { precision: 10, scale: 3 }).notNull(),
  productTitle: varchar('product_title', { length: 500 }),
  size: varchar('size', { length: 10 }),
  color: varchar('color', { length: 50 }),
  imageUrl: text('image_url'),
});

export const addresses = pgTable('addresses', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  street: text('street').notNull(),
  city: varchar('city', { length: 200 }).notNull(),
  governorate: varchar('governorate', { length: 200 }).notNull(),
  postalCode: varchar('postal_code', { length: 20 }),
});

// Shipping
export const shippingZones = pgTable('shipping_zones', {
  id: serial('id').primaryKey(),
  zoneName: varchar('zone_name', { length: 200 }).notNull(),
  zoneNameAr: varchar('zone_name_ar', { length: 200 }),
  price: decimal('price', { precision: 10, scale: 3 }).notNull(),
  freeThreshold: decimal('free_threshold', { precision: 10, scale: 3 }),
  estimatedDays: integer('estimated_days').default(3).notNull(),
});

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  translations: many(categoryTranslations),
  products: many(products),
}));

export const categoryTranslationsRelations = relations(categoryTranslations, ({ one }) => ({
  category: one(categories, { fields: [categoryTranslations.categoryId], references: [categories.id] }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  translations: many(productTranslations),
  images: many(productImages),
  variants: many(productVariants),
}));

export const productTranslationsRelations = relations(productTranslations, ({ one }) => ({
  product: one(products, { fields: [productTranslations.productId], references: [products.id] }),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
}));

export const ordersRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  address: one(addresses, { fields: [orders.id], references: [addresses.orderId] }),
  shippingZone: one(shippingZones, { fields: [orders.shippingZoneId], references: [shippingZones.id] }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
  variant: one(productVariants, { fields: [orderItems.variantId], references: [productVariants.id] }),
}));
