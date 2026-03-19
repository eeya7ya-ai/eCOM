'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, GOVERNORATES } from '@/lib/utils';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Image from 'next/image';
import { ShoppingBag, MapPin, CreditCard, Truck, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface ShippingZone {
  id: number;
  zoneName: string;
  zoneNameAr: string | null;
  price: string;
  freeThreshold: string | null;
  estimatedDays: number;
}

interface CheckoutClientProps {
  locale: string;
  shippingZones: ShippingZone[];
}

function CheckoutForm({ locale, shippingZones }: CheckoutClientProps) {
  const isRTL = locale === 'ar';
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();

  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    governorate: '',
    postalCode: '',
  });
  const [selectedZone, setSelectedZone] = useState<ShippingZone | null>(null);

  useEffect(() => {
    if (formData.governorate) {
      const isAmman = formData.governorate.toLowerCase().includes('amman') || formData.governorate === 'عمان';
      const zone = shippingZones.find((z) =>
        isAmman ? z.zoneName.toLowerCase().includes('amman') : !z.zoneName.toLowerCase().includes('amman')
      ) || shippingZones[0];
      setSelectedZone(zone || null);
    }
  }, [formData.governorate, shippingZones]);

  const getShippingCost = () => {
    if (!selectedZone) return 0;
    const threshold = parseFloat(selectedZone.freeThreshold || '0');
    if (threshold > 0 && subtotal() >= threshold) return 0;
    return parseFloat(selectedZone.price);
  };

  const shippingCost = getShippingCost();
  const total = subtotal() + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    try {
      // Create payment intent
      const piRes = await fetch('/api/stripe/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, currency: 'jod' }),
      });
      const { clientSecret, error: piError } = await piRes.json();
      if (piError) throw new Error(piError);

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: formData.name, email: formData.email },
        },
      });

      if (error) throw new Error(error.message);

      if (paymentIntent?.status === 'succeeded') {
        // Create order
        const orderRes = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: formData.name,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            address: { street: formData.street, city: formData.city, governorate: formData.governorate, postalCode: formData.postalCode },
            items: items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              priceAtPurchase: item.price,
              productTitle: item.title,
              size: item.size,
              color: item.color,
              imageUrl: item.image,
            })),
            totalPrice: total,
            shippingCost,
            shippingZoneId: selectedZone?.id,
            stripePaymentIntentId: paymentIntent.id,
          }),
        });
        const { orderNumber } = await orderRes.json();
        clearCart();
        router.push(`/${locale}/order-confirmation?order=${orderNumber}&email=${formData.email}`);
      }
    } catch (err: any) {
      toast.error(err.message || (isRTL ? 'فشل الدفع. يرجى المحاولة مجدداً.' : 'Payment failed. Please try again.'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <ShoppingBag size={64} className="text-rose-200 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            {isRTL ? 'سلتك فارغة' : 'Your cart is empty'}
          </h2>
          <Link href={`/${locale}/shop`}>
            <button className="btn-primary mt-4">{isRTL ? 'تسوقي الآن' : 'Shop Now'}</button>
          </Link>
        </div>
      </div>
    );
  }

  const steps = [
    { num: 1, label: isRTL ? 'معلومات العميل' : 'Customer Info', icon: MapPin },
    { num: 2, label: isRTL ? 'العنوان والشحن' : 'Shipping', icon: Truck },
    { num: 3, label: isRTL ? 'الدفع' : 'Payment', icon: CreditCard },
  ];

  const isStepValid = (s: number) => {
    if (s === 1) return formData.name && formData.email && formData.phone;
    if (s === 2) return formData.street && formData.city && formData.governorate;
    return true;
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-8 ${isRTL ? 'text-right' : 'text-left'}`}
        >
          <Link href={`/${locale}/cart`}>
            <button className={`flex items-center gap-2 text-gray-500 hover:text-rose-600 transition-colors mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <ArrowLeft size={16} className={isRTL ? 'rotate-180' : ''} />
              {isRTL ? 'العودة للسلة' : 'Back to Cart'}
            </button>
          </Link>
          <h1 className="section-title">{isRTL ? 'إتمام الشراء' : 'Checkout'}</h1>
        </motion.div>

        {/* Steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-4 mb-10"
        >
          {steps.map((s, i) => (
            <div key={s.num} className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    step >= s.num
                      ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step > s.num ? <CheckCircle size={16} /> : s.num}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${step >= s.num ? 'text-gray-900' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-px w-12 sm:w-20 ${step > s.num ? 'bg-gradient-to-r from-rose-400 to-purple-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${isRTL ? 'lg:grid-flow-dense' : ''}`}>
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Customer Info */}
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="card-glass p-6 rounded-2xl space-y-4"
                  >
                    <h2 className={`font-bold text-xl text-gray-900 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-7 h-7 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">1</div>
                      {isRTL ? 'معلومات العميل' : 'Customer Information'}
                    </h2>
                    {[
                      { key: 'name', label: isRTL ? 'الاسم الكامل' : 'Full Name', type: 'text', required: true },
                      { key: 'email', label: isRTL ? 'البريد الإلكتروني' : 'Email Address', type: 'email', required: true },
                      { key: 'phone', label: isRTL ? 'رقم الهاتف' : 'Phone Number', type: 'tel', required: true },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isRTL ? 'text-right' : ''}`}>
                          {field.label} {field.required && <span className="text-rose-500">*</span>}
                        </label>
                        <input
                          type={field.type}
                          value={(formData as any)[field.key]}
                          onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                          className={`input-field ${isRTL ? 'text-right' : ''}`}
                          required={field.required}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => isStepValid(1) && setStep(2)}
                      className={`btn-primary w-full py-3.5 ${!isStepValid(1) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isRTL ? 'التالي: عنوان التسليم' : 'Next: Delivery Address'}
                    </button>
                  </motion.div>
                )}

                {/* Step 2: Address */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="card-glass p-6 rounded-2xl space-y-4"
                  >
                    <h2 className={`font-bold text-xl text-gray-900 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-7 h-7 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">2</div>
                      {isRTL ? 'عنوان التسليم' : 'Delivery Address'}
                    </h2>

                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isRTL ? 'text-right' : ''}`}>
                        {isRTL ? 'المحافظة' : 'Governorate'} <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.governorate}
                        onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                        className={`input-field ${isRTL ? 'text-right' : ''}`}
                        dir={isRTL ? 'rtl' : 'ltr'}
                        required
                      >
                        <option value="">{isRTL ? 'اختاري المحافظة' : 'Select Governorate'}</option>
                        {GOVERNORATES.map((g) => (
                          <option key={g.en} value={g.en}>{isRTL ? g.ar : g.en}</option>
                        ))}
                      </select>
                    </div>

                    {[
                      { key: 'street', label: isRTL ? 'عنوان الشارع' : 'Street Address', required: true },
                      { key: 'city', label: isRTL ? 'المدينة' : 'City', required: true },
                      { key: 'postalCode', label: isRTL ? 'الرمز البريدي' : 'Postal Code', required: false },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isRTL ? 'text-right' : ''}`}>
                          {field.label} {field.required && <span className="text-rose-500">*</span>}
                        </label>
                        <input
                          type="text"
                          value={(formData as any)[field.key]}
                          onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                          className={`input-field ${isRTL ? 'text-right' : ''}`}
                          required={field.required}
                        />
                      </div>
                    ))}

                    {/* Shipping Zone Display */}
                    {selectedZone && (
                      <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                        <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {isRTL ? selectedZone.zoneNameAr || selectedZone.zoneName : selectedZone.zoneName}
                            </p>
                            <p className="text-gray-500 text-xs mt-0.5">
                              {isRTL ? `${selectedZone.estimatedDays} أيام تسليم` : `${selectedZone.estimatedDays} days delivery`}
                            </p>
                          </div>
                          <span className="font-bold text-rose-600">
                            {shippingCost === 0
                              ? (isRTL ? 'مجاني' : 'Free')
                              : formatPrice(shippingCost, locale)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">
                        {isRTL ? 'رجوع' : 'Back'}
                      </button>
                      <button
                        type="button"
                        onClick={() => isStepValid(2) && setStep(3)}
                        className={`btn-primary flex-1 py-3 ${!isStepValid(2) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isRTL ? 'التالي: الدفع' : 'Next: Payment'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Payment */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="card-glass p-6 rounded-2xl space-y-4"
                  >
                    <h2 className={`font-bold text-xl text-gray-900 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-7 h-7 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">3</div>
                      {isRTL ? 'بيانات الدفع' : 'Payment Details'}
                    </h2>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: '16px',
                              color: '#1a1a2e',
                              fontFamily: 'Inter, sans-serif',
                              '::placeholder': { color: '#9ca3af' },
                            },
                          },
                        }}
                      />
                    </div>

                    <div className={`flex items-center gap-2 text-sm text-gray-500 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                      <span>🔒</span>
                      {isRTL ? 'معاملاتك محمية بتشفير SSL' : 'Your transaction is secured with SSL encryption'}
                    </div>

                    <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1 py-3">
                        {isRTL ? 'رجوع' : 'Back'}
                      </button>
                      <button
                        type="submit"
                        disabled={isProcessing || !stripe}
                        className={`btn-primary flex-1 py-3 ${isProcessing ? 'opacity-75' : ''}`}
                      >
                        {isProcessing
                          ? (isRTL ? 'جاري المعالجة...' : 'Processing...')
                          : `${isRTL ? 'ادفع' : 'Pay'} ${formatPrice(total, locale)}`}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-glass p-6 rounded-2xl sticky top-24"
              >
                <h3 className={`font-bold text-lg mb-5 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'ملخص الطلب' : 'Order Summary'}
                </h3>

                <div className="space-y-3 mb-5 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="relative w-14 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        {item.image && <Image src={item.image} alt={item.title} fill className="object-cover" />}
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                          {item.quantity}
                        </span>
                      </div>
                      <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : ''}`}>
                        <p className="text-xs font-medium text-gray-800 truncate">
                          {isRTL ? item.titleAr || item.title : item.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.size} / {item.color}</p>
                        <p className="text-sm font-bold text-rose-600 mt-1">
                          {formatPrice(item.price * item.quantity, locale)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-4 border-t border-gray-100">
                  {[
                    { label: isRTL ? 'المجموع الفرعي' : 'Subtotal', value: formatPrice(subtotal(), locale) },
                    { label: isRTL ? 'الشحن' : 'Shipping', value: shippingCost === 0 ? (isRTL ? 'مجاني' : 'Free') : formatPrice(shippingCost, locale) },
                  ].map((row) => (
                    <div key={row.label} className={`flex justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-gray-600">{row.label}</span>
                      <span className="font-medium">{row.value}</span>
                    </div>
                  ))}
                  <div className={`flex justify-between font-bold text-lg pt-2 border-t border-gray-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
                    <span className="text-rose-600">{formatPrice(total, locale)}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CheckoutClient(props: CheckoutClientProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
}
