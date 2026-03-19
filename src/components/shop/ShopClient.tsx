'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, Search, Grid, List } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';

interface ShopClientProps {
  initialProducts: any[];
  categories: any[];
  locale: string;
  searchParams: Record<string, string>;
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ShopClient({ initialProducts, categories, locale, searchParams }: ShopClientProps) {
  const isRTL = locale === 'ar';
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.category || '');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState(searchParams.search || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get all unique colors from products
  const allColors = useMemo(() => {
    const colorMap = new Map<string, string>();
    initialProducts.forEach((p) => {
      p.variants?.forEach((v: any) => {
        if (v.color && !colorMap.has(v.color)) {
          colorMap.set(v.color, v.colorCode || v.color);
        }
      });
    });
    return Array.from(colorMap.entries()).map(([color, code]) => ({ color, code }));
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    let filtered = [...initialProducts];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.translations?.some((t: any) =>
          t.title?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Category filter
    if (selectedCategory) {
      const cat = categories.find((c) => c.slug === selectedCategory);
      if (cat) {
        filtered = filtered.filter((p) => p.categoryId === cat.id);
      }
    }

    // Also handle "new" and "featured" filter flags
    if (searchParams.filter === 'new') {
      filtered = filtered.filter((p) => p.isNewArrival);
    }
    if (searchParams.filter === 'featured') {
      filtered = filtered.filter((p) => p.isFeatured);
    }

    // Size filter
    if (selectedSizes.length > 0) {
      filtered = filtered.filter((p) =>
        p.variants?.some((v: any) => selectedSizes.includes(v.size) && v.stockQuantity > 0)
      );
    }

    // Color filter
    if (selectedColors.length > 0) {
      filtered = filtered.filter((p) =>
        p.variants?.some((v: any) => selectedColors.includes(v.color))
      );
    }

    // Price filter
    filtered = filtered.filter((p) => {
      const price = parseFloat(p.price);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
    }

    return filtered;
  }, [initialProducts, searchQuery, selectedCategory, selectedSizes, selectedColors, priceRange, sortBy, categories, searchParams.filter]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([0, 200]);
    setSortBy('newest');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory || selectedSizes.length > 0 || selectedColors.length > 0 || priceRange[0] > 0 || priceRange[1] < 200;

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  return (
    <div className="min-h-screen py-8">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={isRTL ? 'text-right' : 'text-left'}
        >
          <h1 className="section-title text-4xl">
            {isRTL ? 'المتجر' : 'Shop'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isRTL
              ? `عرض ${filteredProducts.length} منتج`
              : `Showing ${filteredProducts.length} products`}
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search & Controls Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex flex-wrap items-center gap-4 mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search size={16} className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRTL ? 'right-4' : 'left-4'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRTL ? 'ابحثي عن منتجات...' : 'Search products...'}
              className={`input-field ${isRTL ? 'pr-10 text-right' : 'pl-10'}`}
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field w-auto min-w-44 cursor-pointer"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <option value="newest">{isRTL ? 'الأحدث' : 'Newest'}</option>
            <option value="price-low">{isRTL ? 'السعر: الأقل للأعلى' : 'Price: Low to High'}</option>
            <option value="price-high">{isRTL ? 'السعر: الأعلى للأقل' : 'Price: High to Low'}</option>
          </select>

          {/* Filter Toggle */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
              showFilters
                ? 'border-rose-400 bg-rose-50 text-rose-600'
                : 'border-gray-200 hover:border-rose-300 text-gray-700'
            } font-medium text-sm ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <SlidersHorizontal size={16} />
            {isRTL ? 'الفلاتر' : 'Filters'}
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            )}
          </motion.button>

          {/* View Mode */}
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            {(['grid', 'list'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`p-2.5 transition-colors ${
                  viewMode === mode ? 'bg-rose-50 text-rose-600' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {mode === 'grid' ? <Grid size={16} /> : <List size={16} />}
              </button>
            ))}
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={clearFilters}
              className={`flex items-center gap-1 text-sm text-rose-600 hover:text-rose-700 font-medium ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <X size={14} />
              {isRTL ? 'مسح الفلاتر' : 'Clear Filters'}
            </motion.button>
          )}
        </motion.div>

        <div className={`flex gap-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 280 }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-shrink-0 space-y-6 overflow-hidden"
              >
                <div className="card-glass p-6 rounded-2xl space-y-8">
                  {/* Categories */}
                  <div>
                    <h3 className={`font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider ${isRTL ? 'text-right' : ''}`}>
                      {isRTL ? 'الفئة' : 'Category'}
                    </h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedCategory('')}
                        className={`w-full text-sm py-2 px-3 rounded-xl transition-colors ${
                          !selectedCategory ? 'bg-rose-50 text-rose-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                        } ${isRTL ? 'text-right' : 'text-left'}`}
                      >
                        {isRTL ? 'الكل' : 'All'}
                      </button>
                      {categories.map((cat) => {
                        const name = cat.translations?.find((t: any) => t.language === locale)?.name
                          || cat.translations?.[0]?.name;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.slug)}
                            className={`w-full text-sm py-2 px-3 rounded-xl transition-colors ${
                              selectedCategory === cat.slug ? 'bg-rose-50 text-rose-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                            } ${isRTL ? 'text-right' : 'text-left'}`}
                          >
                            {name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sizes */}
                  <div>
                    <h3 className={`font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider ${isRTL ? 'text-right' : ''}`}>
                      {isRTL ? 'المقاس' : 'Size'}
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {SIZES.map((size) => (
                        <button
                          key={size}
                          onClick={() => toggleSize(size)}
                          className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                            selectedSizes.includes(size)
                              ? 'border-rose-400 bg-rose-50 text-rose-600'
                              : 'border-gray-200 text-gray-600 hover:border-rose-300'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  {allColors.length > 0 && (
                    <div>
                      <h3 className={`font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider ${isRTL ? 'text-right' : ''}`}>
                        {isRTL ? 'اللون' : 'Color'}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {allColors.map(({ color, code }) => (
                          <button
                            key={color}
                            onClick={() => toggleColor(color)}
                            title={color}
                            className={`w-8 h-8 rounded-full border-4 transition-all ${
                              selectedColors.includes(color)
                                ? 'border-rose-500 scale-110 shadow-md'
                                : 'border-white shadow-sm hover:scale-105'
                            }`}
                            style={{ backgroundColor: code }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price Range */}
                  <div>
                    <h3 className={`font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider ${isRTL ? 'text-right' : ''}`}>
                      {isRTL ? 'نطاق السعر' : 'Price Range'}
                    </h3>
                    <div className="space-y-3">
                      <div className={`flex justify-between text-sm text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span>{priceRange[0]} JOD</span>
                        <span>{priceRange[1]} JOD</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={200}
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full accent-rose-500"
                      />
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {isRTL ? 'لا توجد منتجات' : 'No products found'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {isRTL ? 'جربي تغيير الفلاتر' : 'Try changing your filters'}
                </p>
                <button onClick={clearFilters} className="btn-primary">
                  {isRTL ? 'مسح الفلاتر' : 'Clear Filters'}
                </button>
              </motion.div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'
                    : 'flex flex-col gap-4'
                }
              >
                {filteredProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} locale={locale} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
