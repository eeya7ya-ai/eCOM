'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, X, Check, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { slugify } from '@/lib/utils';

interface Category {
  id: number;
  slug: string;
  translations: Array<{ language: string; name: string }>;
}

interface Props {
  categories: Category[];
  locale: string;
}

export default function AdminCategoriesClient({ categories, locale }: Props) {
  const isRTL = locale === 'ar';
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [form, setForm] = useState({ nameEn: '', nameAr: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.nameEn) return;
    setSaving(true);
    try {
      const method = editingCat ? 'PUT' : 'POST';
      const url = editingCat ? `/api/categories/${editingCat.id}` : '/api/categories';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: slugify(form.nameEn),
          translations: [
            { language: 'en', name: form.nameEn },
            { language: 'ar', name: form.nameAr || form.nameEn },
          ],
        }),
      });
      toast.success(editingCat ? (isRTL ? 'تم التحديث' : 'Updated!') : (isRTL ? 'تمت الإضافة' : 'Added!'));
      setShowForm(false);
      setEditingCat(null);
      setForm({ nameEn: '', nameAr: '' });
      router.refresh();
    } catch {
      toast.error('Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(isRTL ? 'حذف الفئة؟' : 'Delete category?')) return;
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      toast.success(isRTL ? 'تم الحذف' : 'Deleted');
      router.refresh();
    } catch { toast.error('Failed'); }
  };

  const openEdit = (cat: Category) => {
    setEditingCat(cat);
    const enT = cat.translations.find((t) => t.language === 'en');
    const arT = cat.translations.find((t) => t.language === 'ar');
    setForm({ nameEn: enT?.name || '', nameAr: arT?.name || '' });
    setShowForm(true);
  };

  const gradients = ['from-rose-500 to-pink-600', 'from-purple-500 to-violet-600', 'from-amber-500 to-orange-600', 'from-teal-500 to-emerald-600'];
  const emojis = ['👗', '🧥', '👜', '💍', '👠', '🎀'];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        <div className={isRTL ? 'text-right' : ''}>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
            {isRTL ? 'الفئات' : 'Categories'}
          </h1>
          <p className="text-gray-500">{categories.length} {isRTL ? 'فئات' : 'categories'}</p>
        </div>
        <button
          onClick={() => { setEditingCat(null); setForm({ nameEn: '', nameAr: '' }); setShowForm(true); }}
          className={`btn-primary flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <Plus size={16} />
          {isRTL ? 'إضافة فئة' : 'Add Category'}
        </button>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat, i) => {
          const enName = cat.translations.find((t) => t.language === 'en')?.name;
          const arName = cat.translations.find((t) => t.language === 'ar')?.name;
          const gradient = gradients[i % gradients.length];
          const emoji = emojis[i % emojis.length];

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card-glass rounded-2xl p-5"
            >
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} text-2xl shadow-md`}>
                    {emoji}
                  </div>
                  <div className={isRTL ? 'text-right' : ''}>
                    <p className="font-bold text-gray-900">{isRTL ? arName || enName : enName}</p>
                    <p className="text-xs text-gray-400 font-mono">{cat.slug}</p>
                    {!isRTL && arName && <p className="text-xs text-gray-500">{arName}</p>}
                  </div>
                </div>
                <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <button onClick={() => openEdit(cat)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowForm(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-[60] bg-white rounded-3xl shadow-2xl p-6 ${isRTL ? 'text-right' : ''}`}
            >
              <div className={`flex items-center justify-between mb-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h2 className="font-bold text-xl">{editingCat ? (isRTL ? 'تعديل الفئة' : 'Edit Category') : (isRTL ? 'إضافة فئة' : 'Add Category')}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{isRTL ? 'الاسم (إنجليزي) *' : 'Name (English) *'}</label>
                  <input type="text" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'}</label>
                  <input type="text" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} className="input-field text-right" dir="rtl" />
                </div>
              </div>
              <div className={`flex gap-3 mt-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">{isRTL ? 'إلغاء' : 'Cancel'}</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Check size={16} />
                  {isRTL ? 'حفظ' : 'Save'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
