'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Eye, Star } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: {
    id: number;
    slug: string;
    price: string;
    isNewArrival?: boolean;
    isFeatured?: boolean;
    translations: Array<{ language: string; title: string; description?: string | null }>;
    images: Array<{ imageUrl: string; displayOrder: number }>;
    variants: Array<{ id: number; size: string; color: string; colorCode?: string | null; stockQuantity: number }>;
  };
  locale: string;
  index?: number;
}

export default function ProductCard({ product, locale, index = 0 }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { addItem, openCart } = useCartStore();
  const isRTL = locale === 'ar';

  const translation = product.translations.find((t) => t.language === locale)
    || product.translations[0];
  const arTranslation = product.translations.find((t) => t.language === 'ar');

  const images = [...product.images].sort((a, b) => a.displayOrder - b.displayOrder);
  const primaryImage = images[0]?.imageUrl;
  const secondaryImage = images[1]?.imageUrl;

  const inStockVariants = product.variants.filter((v) => v.stockQuantity > 0);
  const isOutOfStock = inStockVariants.length === 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || !product.variants.length) return;

    const variant = inStockVariants[0];
    addItem({
      id: `${product.id}-${variant.id}`,
      productId: product.id,
      variantId: variant.id,
      title: product.translations.find((t) => t.language === 'en')?.title || translation.title,
      titleAr: arTranslation?.title || translation.title,
      price: parseFloat(product.price),
      image: primaryImage || '',
      size: variant.size,
      color: variant.color,
      colorCode: variant.colorCode || undefined,
      quantity: 1,
      maxQuantity: variant.stockQuantity,
    });
    openCart();
    toast.success(isRTL ? 'تمت الإضافة إلى السلة!' : 'Added to cart!');
  };

  const colorSet = new Set<string>();
  product.variants.forEach((v) => colorSet.add(v.color));
  const uniqueColors = Array.from(colorSet);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="product-card group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/${locale}/product/${product.slug}`}>
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-rose-50 to-purple-50">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={translation?.title || ''}
              fill
              className={`object-cover transition-all duration-700 ${
                isHovered && secondaryImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
              }`}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-rose-100 via-pink-100 to-purple-100 flex items-center justify-center">
              <ShoppingBag size={40} className="text-rose-300" />
            </div>
          )}

          {secondaryImage && (
            <Image
              src={secondaryImage}
              alt={translation?.title || ''}
              fill
              className={`object-cover transition-all duration-700 absolute inset-0 ${
                isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
            />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} flex flex-col gap-2`}>
            {product.isNewArrival && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="badge bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg text-xs px-2.5 py-1"
              >
                {isRTL ? 'جديد' : 'NEW'}
              </motion.span>
            )}
            {product.isFeatured && (
              <span className="badge bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg text-xs px-2.5 py-1">
                <Star size={10} className="inline mr-1" />
                {isRTL ? 'مميز' : 'Featured'}
              </span>
            )}
            {isOutOfStock && (
              <span className="badge bg-gray-800/80 text-white text-xs px-2.5 py-1">
                {isRTL ? 'نفد المخزون' : 'Sold Out'}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} flex flex-col gap-2`}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.preventDefault(); setIsWishlisted(!isWishlisted); }}
              className="w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-all"
            >
              <Heart
                size={15}
                className={isWishlisted ? 'text-rose-500 fill-rose-500' : 'text-gray-600'}
              />
            </motion.button>
            <Link href={`/${locale}/product/${product.slug}`}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <Eye size={15} className="text-gray-600" />
              </motion.button>
            </Link>
          </div>

          {/* Quick Add Button */}
          <motion.button
            onClick={handleQuickAdd}
            initial={{ y: 60, opacity: 0 }}
            animate={isHovered ? { y: 0, opacity: 1 } : { y: 60, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm ${
              isOutOfStock
                ? 'bg-gray-800/80 text-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-rose-500 to-purple-600 text-white hover:shadow-lg hover:shadow-rose-300'
            } transition-all duration-200`}
          >
            <ShoppingBag size={15} />
            {isOutOfStock
              ? (isRTL ? 'نفد المخزون' : 'Out of Stock')
              : (isRTL ? 'إضافة سريعة' : 'Quick Add')}
          </motion.button>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Color swatches */}
          {uniqueColors.length > 0 && (
            <div className={`flex gap-1.5 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {uniqueColors.slice(0, 5).map((color) => {
                const variant = product.variants.find((v) => v.color === color);
                return (
                  <div
                    key={color}
                    title={color}
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: variant?.colorCode || color }}
                  />
                );
              })}
              {uniqueColors.length > 5 && (
                <span className="text-xs text-gray-400">+{uniqueColors.length - 5}</span>
              )}
            </div>
          )}

          <h3 className={`font-semibold text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-rose-600 transition-colors ${isRTL ? 'text-right' : 'text-left'}`}>
            {translation?.title}
          </h3>

          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="font-bold text-rose-600 text-base">
              {formatPrice(product.price, locale)}
            </span>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={10} className="text-amber-400 fill-amber-400" />
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
