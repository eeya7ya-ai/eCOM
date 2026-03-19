'use client';
import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Share2, Star, ChevronLeft, ChevronRight, Check, Minus, Plus } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import ProductCard from '@/components/ui/ProductCard';

interface ProductPageClientProps {
  product: any;
  relatedProducts: any[];
  locale: string;
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ProductPageClient({ product, relatedProducts, locale }: ProductPageClientProps) {
  const isRTL = locale === 'ar';
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem, openCart } = useCartStore();

  const translation = product.translations?.find((t: any) => t.language === locale)
    || product.translations?.[0];
  const arTranslation = product.translations?.find((t: any) => t.language === 'ar');
  const enTranslation = product.translations?.find((t: any) => t.language === 'en');

  const images = [...(product.images || [])].sort((a: any, b: any) => a.displayOrder - b.displayOrder);

  // Get unique colors
  const colorMap = new Map<string, { color: string; colorCode: string | null }>();
  product.variants?.forEach((v: any) => {
    if (!colorMap.has(v.color)) colorMap.set(v.color, { color: v.color, colorCode: v.colorCode });
  });
  const uniqueColors = Array.from(colorMap.values());

  // Get available sizes for selected color
  const availableSizes = selectedColor
    ? product.variants?.filter((v: any) => v.color === selectedColor && v.stockQuantity > 0).map((v: any) => v.size)
    : product.variants?.filter((v: any) => v.stockQuantity > 0).map((v: any) => v.size);

  // Get selected variant
  const selectedVariant = product.variants?.find(
    (v: any) => v.size === selectedSize && v.color === selectedColor
  );

  const stockQty = selectedVariant?.stockQuantity || 0;
  const canAddToCart = selectedSize && selectedColor && stockQty > 0;

  const handleAddToCart = () => {
    if (!canAddToCart || !selectedVariant) return;

    addItem({
      id: `${product.id}-${selectedVariant.id}`,
      productId: product.id,
      variantId: selectedVariant.id,
      title: enTranslation?.title || translation?.title || '',
      titleAr: arTranslation?.title || translation?.title || '',
      price: parseFloat(product.price),
      image: images[0]?.imageUrl || '',
      size: selectedSize,
      color: selectedColor,
      colorCode: selectedVariant.colorCode,
      quantity,
      maxQuantity: stockQty,
    });

    setAddedToCart(true);
    openCart();
    toast.success(isRTL ? 'تمت الإضافة إلى السلة!' : 'Added to cart!');
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const prevImage = () => setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  const nextImage = () => setSelectedImage((prev) => (prev + 1) % images.length);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`flex items-center gap-2 text-sm text-gray-500 mb-8 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}
        >
          <a href={`/${locale}`} className="hover:text-rose-600 transition-colors">
            {isRTL ? 'الرئيسية' : 'Home'}
          </a>
          <span>/</span>
          <a href={`/${locale}/shop`} className="hover:text-rose-600 transition-colors">
            {isRTL ? 'المتجر' : 'Shop'}
          </a>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-32">{translation?.title}</span>
        </motion.nav>

        {/* Main Product Grid */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 ${isRTL ? 'lg:grid-flow-col-dense' : ''}`}>
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-gradient-to-br from-rose-50 to-purple-50 shadow-xl">
              {images.length > 0 ? (
                <Image
                  src={images[selectedImage]?.imageUrl}
                  alt={translation?.title || ''}
                  fill
                  className="object-cover transition-all duration-500"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag size={60} className="text-rose-200" />
                </div>
              )}

              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white transition-all shadow-lg`}
                  >
                    <ChevronLeft size={18} className={isRTL ? 'rotate-180' : ''} />
                  </button>
                  <button
                    onClick={nextImage}
                    className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white transition-all shadow-lg`}
                  >
                    <ChevronRight size={18} className={isRTL ? 'rotate-180' : ''} />
                  </button>
                </>
              )}

              {/* Wishlist */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} w-10 h-10 rounded-full glass flex items-center justify-center shadow-md`}
              >
                <Heart size={18} className={isWishlisted ? 'text-rose-500 fill-rose-500' : 'text-gray-600'} />
              </motion.button>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className={`flex gap-3 overflow-x-auto pb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {images.map((img: any, i: number) => (
                  <motion.button
                    key={img.id}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedImage(i)}
                    className={`relative flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === i ? 'border-rose-500 shadow-md' : 'border-transparent'
                    }`}
                  >
                    <Image src={img.imageUrl} alt="" fill className="object-cover" />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -40 : 40 }}
            animate={{ opacity: 1, x: 0 }}
            className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`}
          >
            {/* Category */}
            {product.category && (
              <span className="inline-block text-xs font-semibold text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-1.5 rounded-full">
                {product.category.translations?.find((t: any) => t.language === locale)?.name
                  || product.category.translations?.[0]?.name}
              </span>
            )}

            {/* Title */}
            <h1
              className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              {translation?.title}
            </h1>

            {/* Rating */}
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <span className="text-sm text-gray-500">(24 {isRTL ? 'مراجعة' : 'reviews'})</span>
            </div>

            {/* Price */}
            <div>
              <span className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
                {formatPrice(product.price, locale)}
              </span>
            </div>

            {/* Color Selection */}
            {uniqueColors.length > 0 && (
              <div>
                <label className="block font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wider">
                  {isRTL ? 'اللون' : 'Color'}
                  {selectedColor && (
                    <span className="ms-2 font-normal text-gray-500 normal-case tracking-normal">
                      — {selectedColor}
                    </span>
                  )}
                </label>
                <div className={`flex gap-3 flex-wrap ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                  {uniqueColors.map(({ color, colorCode }) => (
                    <motion.button
                      key={color}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setSelectedColor(color); setSelectedSize(''); }}
                      title={color}
                      className={`w-10 h-10 rounded-full border-4 transition-all shadow-sm ${
                        selectedColor === color
                          ? 'border-rose-500 scale-110 shadow-lg'
                          : 'border-white hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: colorCode || color }}
                    >
                      {selectedColor === color && (
                        <Check size={14} className="text-white mx-auto drop-shadow-md" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div>
              <label className="block font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wider">
                {isRTL ? 'المقاس' : 'Size'}
              </label>
              <div className={`flex gap-2 flex-wrap ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                {SIZES.map((size) => {
                  const isAvailable = availableSizes?.includes(size);
                  const isSelected = selectedSize === size;
                  return (
                    <motion.button
                      key={size}
                      whileHover={isAvailable ? { scale: 1.05 } : {}}
                      whileTap={isAvailable ? { scale: 0.95 } : {}}
                      onClick={() => isAvailable && setSelectedSize(size)}
                      className={`w-12 h-12 rounded-xl text-sm font-semibold border-2 transition-all ${
                        isSelected
                          ? 'border-rose-500 bg-gradient-to-br from-rose-500 to-purple-600 text-white shadow-lg'
                          : isAvailable
                          ? 'border-gray-200 text-gray-700 hover:border-rose-400 hover:text-rose-600'
                          : 'border-gray-100 text-gray-300 cursor-not-allowed line-through'
                      }`}
                    >
                      {size}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Stock indicator */}
            {selectedVariant && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}
              >
                <div className={`w-2 h-2 rounded-full ${stockQty > 5 ? 'bg-green-500' : stockQty > 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600">
                  {stockQty > 5
                    ? (isRTL ? 'متوفر في المخزون' : 'In Stock')
                    : stockQty > 0
                    ? (isRTL ? `متبقي ${stockQty} فقط` : `Only ${stockQty} left`)
                    : (isRTL ? 'نفد المخزون' : 'Out of Stock')}
                </span>
              </motion.div>
            )}

            {/* Quantity */}
            <div>
              <label className="block font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wider">
                {isRTL ? 'الكمية' : 'Quantity'}
              </label>
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-rose-400 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="text-lg font-bold w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(stockQty || 10, quantity + 1))}
                  className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-rose-400 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Add to Cart & Wishlist */}
            <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <motion.button
                whileHover={canAddToCart ? { scale: 1.02 } : {}}
                whileTap={canAddToCart ? { scale: 0.98 } : {}}
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-base transition-all ${
                  canAddToCart
                    ? addedToCart
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'btn-primary py-4 shadow-xl shadow-rose-300/50'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                } ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                {addedToCart ? (
                  <>
                    <Check size={20} />
                    {isRTL ? 'تمت الإضافة!' : 'Added!'}
                  </>
                ) : (
                  <>
                    <ShoppingBag size={20} />
                    {!selectedSize || !selectedColor
                      ? (isRTL ? 'اختاري المقاس واللون' : 'Select Size & Color')
                      : !stockQty
                      ? (isRTL ? 'نفد المخزون' : 'Out of Stock')
                      : (isRTL ? 'أضف للسلة' : 'Add to Cart')}
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${
                  isWishlisted
                    ? 'border-rose-400 bg-rose-50'
                    : 'border-gray-200 hover:border-rose-300'
                }`}
              >
                <Heart size={20} className={isWishlisted ? 'text-rose-500 fill-rose-500' : 'text-gray-500'} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 rounded-2xl border-2 border-gray-200 flex items-center justify-center hover:border-purple-300 transition-all"
              >
                <Share2 size={18} className="text-gray-500" />
              </motion.button>
            </div>

            {/* Description */}
            {translation?.description && (
              <div className={`pt-4 border-t border-gray-100 ${isRTL ? 'text-right' : 'text-left'}`}>
                <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">
                  {isRTL ? 'الوصف' : 'Description'}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">{translation.description}</p>
              </div>
            )}

            {/* Features */}
            <div className={`pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              {[
                { icon: '🚚', title: isRTL ? 'شحن سريع' : 'Fast Delivery', desc: isRTL ? '1-3 أيام' : '1-3 Days' },
                { icon: '↩️', title: isRTL ? 'إرجاع سهل' : 'Easy Returns', desc: isRTL ? '14 يوم' : '14 Days' },
                { icon: '🔒', title: isRTL ? 'دفع آمن' : 'Secure Pay', desc: isRTL ? 'مشفر' : 'Encrypted' },
              ].map((feature, i) => (
                <div key={i} className={`text-center p-3 bg-gray-50 rounded-xl`}>
                  <div className="text-2xl mb-1">{feature.icon}</div>
                  <p className="text-xs font-semibold text-gray-700">{feature.title}</p>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`mb-10 ${isRTL ? 'text-right' : 'text-left'}`}
            >
              <h2 className="section-title">
                {isRTL ? 'قد يعجبك أيضاً' : 'You May Also Like'}
              </h2>
            </motion.div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} locale={locale} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
