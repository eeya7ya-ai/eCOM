'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Truck, X, Check } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Zone {
  id: number;
  zoneName: string;
  zoneNameAr: string | null;
  price: string;
  freeThreshold: string | null;
  estimatedDays: number;
}

interface Props {
  zones: Zone[];
  locale: string;
}

const defaultForm = { zoneName: '', zoneNameAr: '', price: '', freeThreshold: '', estimatedDays: 3 };

export default function AdminShippingClient({ zones, locale }: Props) {
  const isRTL = locale === 'ar';
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.zoneName || !form.price) return;
    setSaving(true);
    try {
      const method = editingZone ? 'PUT' : 'POST';
      const url = editingZone ? `/api/shipping/${editingZone.id}` : '/api/shipping';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zoneName: form.zoneName,
          zoneNameAr: form.zoneNameAr || null,
          price: parseFloat(form.price),
          freeThreshold: form.freeThreshold ? parseFloat(form.freeThreshold) : null,
          estimatedDays: form.estimatedDays,
        }),
      });
      toast.success(editingZone ? (isRTL ? 'تم التحديث' : 'Updated!') : (isRTL ? 'تمت الإضافة' : 'Added!'));
      setShowForm(false);
      setEditingZone(null);
      setForm(defaultForm);
      router.refresh();
    } catch {
      toast.error('Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(isRTL ? 'حذف المنطقة؟' : 'Delete zone?')) return;
    try {
      await fetch(`/api/shipping/${id}`, { method: 'DELETE' });
      toast.success(isRTL ? 'تم الحذف' : 'Deleted');
      router.refresh();
    } catch { toast.error('Failed'); }
  };

  const openEdit = (zone: Zone) => {
    setEditingZone(zone);
    setForm({
      zoneName: zone.zoneName,
      zoneNameAr: zone.zoneNameAr || '',
      price: zone.price,
      freeThreshold: zone.freeThreshold || '',
      estimatedDays: zone.estimatedDays,
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        <div className={isRTL ? 'text-right' : ''}>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
            {isRTL ? 'مناطق الشحن' : 'Shipping Zones'}
          </h1>
          <p className="text-gray-500">{zones.length} {isRTL ? 'مناطق' : 'zones'}</p>
        </div>
        <button
          onClick={() => { setEditingZone(null); setForm(defaultForm); setShowForm(true); }}
          className={`btn-primary flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <Plus size={16} />
          {isRTL ? 'إضافة منطقة' : 'Add Zone'}
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {zones.map((zone, i) => (
          <motion.div
            key={zone.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card-glass rounded-2xl p-5"
          >
            <div className={`flex items-start justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                  <Truck size={18} className="text-white" />
                </div>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="font-bold text-gray-900">{isRTL ? zone.zoneNameAr || zone.zoneName : zone.zoneName}</p>
                  <p className="text-xs text-gray-500">{zone.estimatedDays} {isRTL ? 'أيام' : 'days'}</p>
                </div>
              </div>
              <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button onClick={() => openEdit(zone)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg">
                  <Edit size={14} />
                </button>
                <button onClick={() => handleDelete(zone.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className={`grid grid-cols-2 gap-3 ${isRTL ? 'text-right' : ''}`}>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">{isRTL ? 'سعر الشحن' : 'Shipping Price'}</p>
                <p className="font-bold text-rose-600">{formatPrice(zone.price, locale)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">{isRTL ? 'شحن مجاني فوق' : 'Free above'}</p>
                <p className="font-bold text-green-600">
                  {zone.freeThreshold ? formatPrice(zone.freeThreshold, locale) : (isRTL ? 'لا يوجد' : 'None')}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Form Modal */}
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
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[60] bg-white rounded-3xl shadow-2xl p-6 ${isRTL ? 'text-right' : ''}`}
            >
              <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h2 className="font-bold text-xl">
                  {editingZone ? (isRTL ? 'تعديل المنطقة' : 'Edit Zone') : (isRTL ? 'إضافة منطقة' : 'Add Zone')}
                </h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'zoneName', label: isRTL ? 'اسم المنطقة (إنجليزي)' : 'Zone Name (English)', placeholder: 'Amman' },
                  { key: 'zoneNameAr', label: isRTL ? 'اسم المنطقة (عربي)' : 'Zone Name (Arabic)', placeholder: 'عمان', rtl: true },
                  { key: 'price', label: isRTL ? 'سعر الشحن (د.أ)' : 'Shipping Price (JOD)', type: 'number', placeholder: '2.000' },
                  { key: 'freeThreshold', label: isRTL ? 'شحن مجاني فوق (اختياري)' : 'Free Threshold (optional)', type: 'number', placeholder: '50.000' },
                  { key: 'estimatedDays', label: isRTL ? 'أيام التسليم' : 'Delivery Days', type: 'number', placeholder: '3' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
                    <input
                      type={field.type || 'text'}
                      value={(form as any)[field.key]}
                      onChange={(e) => setForm({ ...form, [field.key]: field.type === 'number' ? parseFloat(e.target.value) || e.target.value : e.target.value })}
                      placeholder={field.placeholder}
                      className={`input-field ${field.rtl ? 'text-right' : ''}`}
                      dir={field.rtl ? 'rtl' : 'ltr'}
                    />
                  </div>
                ))}
              </div>

              <div className={`flex gap-3 mt-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button onClick={handleSave} disabled={saving} className={`btn-primary flex-1 flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
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
