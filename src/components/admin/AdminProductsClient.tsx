'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Upload, X, Check, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { formatPrice, slugify } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

interface AdminProductsClientProps {
  products: any[];
  categories: any[];
  locale: string;
}

interface ProductFormData {
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  price: string;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  images: string[];
  variants: Array<{ size: string; color: string; colorCode: string; stock: number }>;
}

const defaultForm: ProductFormData = {
  titleEn: '', titleAr: '', descEn: '', descAr: '',
  price: '', categoryId: '', isActive: true,
  isFeatured: false, isNewArrival: false,
  images: [], variants: [],
};

export default function AdminProductsClient({ products, categories, locale }: AdminProductsClientProps) {
  const isRTL = locale === 'ar';
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [form, setForm] = useState<ProductFormData>(defaultForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newVariant, setNewVariant] = useState({ size: 'M', color: '', colorCode: '#000000', stock: 0 });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.url) {
          setForm((prev) => ({ ...prev, images: [...prev.images, data.url] }));
        }
      }
      toast.success(isRTL ? 'تم رفع الصور!' : 'Images uploaded!');
    } catch {
      toast.error(isRTL ? 'فشل رفع الصورة' : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const addVariant = () => {
    if (!newVariant.color) return;
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, { ...newVariant }],
    }));
    setNewVariant({ size: 'M', color: '', colorCode: '#000000', stock: 0 });
  };

  const removeVariant = (i: number) => {
    setForm((prev) => ({ ...prev, variants: prev.variants.filter((_, idx) => idx !== i) }));
  };

  const openEdit = (product: any) => {
    setEditingProduct(product);
    const enT = product.translations?.find((t: any) => t.language === 'en');
    const arT = product.translations?.find((t: any) => t.language === 'ar');
    setForm({
      titleEn: enT?.title || '',
      titleAr: arT?.title || '',
      descEn: enT?.description || '',
      descAr: arT?.description || '',
      price: product.price || '',
      categoryId: product.categoryId?.toString() || '',
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      isNewArrival: product.isNewArrival,
      images: product.images?.map((img: any) => img.imageUrl) || [],
      variants: product.variants?.map((v: any) => ({
        size: v.size, color: v.color, colorCode: v.colorCode || '#000000', stock: v.stockQuantity,
      })) || [],
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.titleEn || !form.price) {
      toast.error(isRTL ? 'يرجى ملء الحقول المطلوبة' : 'Please fill required fields');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        slug: slugify(form.titleEn),
        price: parseFloat(form.price),
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        isNewArrival: form.isNewArrival,
        translations: [
          { language: 'en', title: form.titleEn, description: form.descEn },
          { language: 'ar', title: form.titleAr || form.titleEn, description: form.descAr },
        ],
        images: form.images.map((url, i) => ({ imageUrl: url, displayOrder: i })),
        variants: form.variants.map((v) => ({
          size: v.size, color: v.color, colorCode: v.colorCode, stockQuantity: v.stock,
        })),
      };

      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save');
      toast.success(editingProduct
        ? (isRTL ? 'تم تحديث المنتج!' : 'Product updated!')
        : (isRTL ? 'تم إضافة المنتج!' : 'Product added!'));
      setShowForm(false);
      setForm(defaultForm);
      setEditingProduct(null);
      router.refresh();
    } catch {
      toast.error(isRTL ? 'فشل حفظ المنتج' : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Are you sure you want to delete this product?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      toast.success(isRTL ? 'تم حذف المنتج' : 'Product deleted');
      router.refresh();
    } catch {
      toast.error(isRTL ? 'فشل الحذف' : 'Delete failed');
    }
  };

  const handleToggleActive = async (product: any) => {
    try {
      await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      router.refresh();
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        <div className={isRTL ? 'text-right' : ''}>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
            {isRTL ? 'المنتجات' : 'Products'}
          </h1>
          <p className="text-gray-500">{products.length} {isRTL ? 'منتج' : 'products'}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setEditingProduct(null); setForm(defaultForm); setShowForm(true); }}
          className={`btn-primary flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <Plus size={18} />
          {isRTL ? 'إضافة منتج' : 'Add Product'}
        </motion.button>
      </motion.div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-glass rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/80">
              <tr className={isRTL ? 'text-right' : 'text-left'}>
                {['', isRTL ? 'المنتج' : 'Product', isRTL ? 'الفئة' : 'Category', isRTL ? 'السعر' : 'Price', isRTL ? 'المخزون' : 'Stock', isRTL ? 'الحالة' : 'Status', isRTL ? 'إجراءات' : 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    {isRTL ? 'لا توجد منتجات. أضف منتجاً جديداً.' : 'No products yet. Add your first product.'}
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const trans = product.translations?.find((t: any) => t.language === locale) || product.translations?.[0];
                  const img = product.images?.[0]?.imageUrl;
                  const totalStock = product.variants?.reduce((sum: number, v: any) => sum + v.stockQuantity, 0) || 0;
                  const cat = categories.find((c) => c.id === product.categoryId);
                  const catName = cat?.translations?.find((t: any) => t.language === locale)?.name || cat?.slug;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-gray-100">
                          {img ? <Image src={img} alt="" fill className="object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-rose-100 to-purple-100" />}
                        </div>
                      </td>
                      <td className={`px-4 py-3 ${isRTL ? 'text-right' : ''}`}>
                        <p className="font-semibold text-sm text-gray-900 truncate max-w-40">{trans?.title}</p>
                        <p className="text-xs text-gray-400 font-mono">{product.slug}</p>
                      </td>
                      <td className={`px-4 py-3 text-sm text-gray-600 ${isRTL ? 'text-right' : ''}`}>{catName || '—'}</td>
                      <td className={`px-4 py-3 font-semibold text-rose-600 text-sm ${isRTL ? 'text-right' : ''}`}>{formatPrice(product.price, locale)}</td>
                      <td className={`px-4 py-3 ${isRTL ? 'text-right' : ''}`}>
                        <span className={`text-sm font-medium ${totalStock < 5 ? 'text-red-600' : 'text-green-600'}`}>
                          {totalStock < 5 && totalStock > 0 && <AlertTriangle size={12} className="inline mr-1" />}
                          {totalStock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggleActive(product)} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${product.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'} transition-colors`}>
                          {product.isActive ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'معطل' : 'Inactive')}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                          <button onClick={() => openEdit(product)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit size={15} />
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Product Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`fixed inset-4 sm:inset-8 z-[60] bg-white rounded-3xl shadow-2xl overflow-y-auto ${isRTL ? 'text-right' : ''}`}
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingProduct ? (isRTL ? 'تعديل المنتج' : 'Edit Product') : (isRTL ? 'إضافة منتج جديد' : 'Add New Product')}
                </h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {isRTL ? 'الاسم (إنجليزي) *' : 'Title (English) *'}
                    </label>
                    <input type="text" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {isRTL ? 'الاسم (عربي)' : 'Title (Arabic)'}
                    </label>
                    <input type="text" value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} className="input-field text-right" dir="rtl" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (English)</label>
                    <textarea value={form.descEn} onChange={(e) => setForm({ ...form, descEn: e.target.value })} className="input-field h-24 resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">الوصف (عربي)</label>
                    <textarea value={form.descAr} onChange={(e) => setForm({ ...form, descAr: e.target.value })} className="input-field h-24 resize-none text-right" dir="rtl" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{isRTL ? 'السعر (د.أ) *' : 'Price (JOD) *'}</label>
                    <input type="number" step="0.001" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{isRTL ? 'الفئة' : 'Category'}</label>
                    <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input-field">
                      <option value="">{isRTL ? 'اختر فئة' : 'Select Category'}</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.translations?.find((t: any) => t.language === locale)?.name || c.slug}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">{isRTL ? 'الخصائص' : 'Flags'}</label>
                    {[
                      { key: 'isActive', label: isRTL ? 'نشط' : 'Active' },
                      { key: 'isFeatured', label: isRTL ? 'مميز' : 'Featured' },
                      { key: 'isNewArrival', label: isRTL ? 'وصول جديد' : 'New Arrival' },
                    ].map((flag) => (
                      <label key={flag.key} className={`flex items-center gap-2 cursor-pointer ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                        <input
                          type="checkbox"
                          checked={(form as any)[flag.key]}
                          onChange={(e) => setForm({ ...form, [flag.key]: e.target.checked })}
                          className="w-4 h-4 accent-rose-500"
                        />
                        <span className="text-sm text-gray-700">{flag.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">{isRTL ? 'الصور' : 'Images'}</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
                    {form.images.map((url, i) => (
                      <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden group">
                        <Image src={url} alt="" fill className="object-cover" />
                        <button
                          onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} className="text-white" />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-rose-400 transition-colors">
                      <Upload size={20} className="text-gray-400 mb-1" />
                      <span className="text-xs text-gray-400">{uploading ? '...' : (isRTL ? 'رفع' : 'Upload')}</span>
                      <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
                    </label>
                  </div>
                </div>

                {/* Variants */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">{isRTL ? 'المتغيرات (المقاس + اللون + المخزون)' : 'Variants (Size + Color + Stock)'}</label>

                  {form.variants.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {form.variants.map((v, i) => (
                        <div key={i} className={`flex items-center gap-3 p-3 bg-gray-50 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm flex-shrink-0" style={{ backgroundColor: v.colorCode }} />
                          <span className="text-sm font-medium text-gray-700 flex-1">{v.size} / {v.color}</span>
                          <span className="text-sm text-gray-500">{v.stock} {isRTL ? 'قطعة' : 'pcs'}</span>
                          <button onClick={() => removeVariant(i)} className="p-1 text-red-400 hover:text-red-600">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className={`flex gap-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <select value={newVariant.size} onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })} className="input-field w-20">
                      {SIZES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <input type="text" value={newVariant.color} onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })} placeholder={isRTL ? 'اللون' : 'Color'} className="input-field flex-1 min-w-24" />
                    <input type="color" value={newVariant.colorCode} onChange={(e) => setNewVariant({ ...newVariant, colorCode: e.target.value })} className="h-[46px] w-12 rounded-lg border border-gray-200 cursor-pointer" />
                    <input type="number" value={newVariant.stock} onChange={(e) => setNewVariant({ ...newVariant, stock: parseInt(e.target.value) || 0 })} className="input-field w-24" placeholder={isRTL ? 'مخزون' : 'Stock'} min="0" />
                    <button onClick={addVariant} className="btn-primary px-4">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <div className={`flex justify-end gap-3 pt-4 border-t ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <button onClick={() => setShowForm(false)} className="btn-secondary px-6">
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button onClick={handleSave} disabled={saving} className={`btn-primary px-8 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (
                      <>
                        <Check size={16} />
                        {isRTL ? 'حفظ المنتج' : 'Save Product'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
