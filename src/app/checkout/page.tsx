'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { PaymentSettings, PaymentMethod, OrderType } from '@/types';
import { formatPKR } from '@/lib/format';
import { isPaymentMethodAvailable } from '@/lib/paymentMethods';
import {
  CreditCard,
  Banknote,
  Upload,
  ArrowRight,
  MapPin,
  Phone,
  User,
  AlertCircle,
  CheckCircle2,
  Building,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [paymentSettingsLoaded, setPaymentSettingsLoaded] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [usePhoneForWhatsApp, setUsePhoneForWhatsApp] = useState(true);
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [addressNotes, setAddressNotes] = useState('');
  const [customerInstructions, setCustomerInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery');
  const [paymentReference, setPaymentReference] = useState('');

  // Payment Receipt Upload
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings/payment');
        const data = await res.json();
        if (data.settings) {
          setPaymentSettings(data.settings);
        }
      } catch (e) {
        console.error('Failed to load payment settings:', e);
      } finally {
        setPaymentSettingsLoaded(true);
      }
    }
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!paymentSettings) return;

    const paymentMethods: PaymentMethod[] = [
      'cash_on_delivery',
      'easypaisa',
      'jazzcash',
      'bank_transfer',
    ];
    const availableMethods = paymentMethods.filter((method) =>
      isPaymentMethodAvailable(paymentSettings, method)
    );

    if (!availableMethods.includes(paymentMethod)) {
      setPaymentMethod(availableMethods[0] ?? 'cash_on_delivery');
    }
  }, [paymentSettings, paymentMethod]);

  // Handle receipt upload
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReceiptFile(file);
    setUploadingReceipt(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setReceiptUrl(data.url);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Could not upload payment slip. You can also share it directly on WhatsApp.'
      );
    } finally {
      setUploadingReceipt(false);
    }
  };

  // Calculations
  const defaultDeliveryFee = paymentSettings?.defaultDeliveryFee ?? 150;
  const freeThreshold = paymentSettings?.freeDeliveryThreshold ?? 3500;
  const isFreeDelivery = orderType === 'delivery' && subtotal >= freeThreshold && freeThreshold > 0;
  const deliveryFee = orderType === 'delivery' ? (isFreeDelivery ? 0 : defaultDeliveryFee) : 0;
  const totalPayable = subtotal + deliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Please add items to checkout.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMessage('Please enter a valid Pakistani phone number (e.g., 0314 1915087).');
      return;
    }

    if (orderType === 'delivery' && (!deliveryAddress || deliveryAddress.trim().length < 5)) {
      setErrorMessage('Please enter your full delivery address (house #, street, landmark).');
      return;
    }

    if (
      !paymentSettingsLoaded ||
      !paymentSettings ||
      !isPaymentMethodAvailable(paymentSettings, paymentMethod)
    ) {
      setErrorMessage('No valid payment method is available right now. Please contact the restaurant.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        phone: phone.trim(),
        whatsappNumber: usePhoneForWhatsApp ? phone.trim() : whatsappNumber.trim(),
        orderType,
        deliveryAddress: orderType === 'delivery' ? deliveryAddress.trim() : undefined,
        addressNotes: addressNotes.trim() || undefined,
        customerInstructions: customerInstructions.trim() || undefined,
        paymentMethod,
        paymentReceiptUrl: receiptUrl || undefined,
        paymentReference: paymentReference.trim() || undefined,
        items: items.map((i) => ({
          menuItemId: i.menuItemId,
          variantId: i.variantId,
          quantity: i.quantity,
          addOnIds: i.addOns ? i.addOns.map((a) => a.id) : [],
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      // Order saved in DB successfully!
      clearCart();

      // Forward to confirmation page with created order ID
      router.push(`/orders/${data.order.id}`);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Error processing order. Please try again.'
      );
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-3xl font-black text-white font-heading">
          Your cart is empty
        </h1>
        <p className="text-sm text-zinc-400">
          Please add items to your cart before proceeding to checkout.
        </p>
        <Link
          href="/menu"
          className="inline-flex px-6 py-3 rounded-xl bg-grill-orange text-white font-bold text-sm shadow-orangeGlow"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="pb-6 border-b border-grill-border">
        <h1 className="text-3xl font-black text-white font-heading">
          Checkout & Order Confirmation
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Complete your contact information and select your preferred payment method.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-700/80 text-red-200 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Customer & Delivery Details + Payment Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Type Toggle (Delivery vs Takeaway) */}
          <div className="p-6 rounded-3xl bg-grill-card border border-grill-border space-y-4">
            <h2 className="text-lg font-bold text-white font-heading">
              1. Choose Order Type
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`py-3.5 px-4 rounded-2xl border text-center font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  orderType === 'delivery'
                    ? 'border-grill-gold bg-grill-gold/20 text-grill-gold shadow-gold'
                    : 'border-zinc-800 bg-grill-dark text-zinc-400 hover:text-white'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Home Delivery</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('takeaway')}
                className={`py-3.5 px-4 rounded-2xl border text-center font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  orderType === 'takeaway'
                    ? 'border-grill-gold bg-grill-gold/20 text-grill-gold shadow-gold'
                    : 'border-zinc-800 bg-grill-dark text-zinc-400 hover:text-white'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Takeaway / Pickup</span>
              </button>
            </div>
            {orderType === 'takeaway' && (
              <p className="text-xs text-zinc-400 bg-grill-dark p-3 rounded-xl border border-zinc-800">
                📍 Takeaway address: <strong>Main Grand Trunk Road, near Sunny Pan Shop, Baghbanpura, Lahore</strong>. You will receive an alert when your order is packed!
              </p>
            )}
          </div>

          {/* Customer Contact Details */}
          <div className="p-6 rounded-3xl bg-grill-card border border-grill-border space-y-4">
            <h2 className="text-lg font-bold text-white font-heading">
              2. Contact & Address Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Usman Malik"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-grill-dark border border-zinc-800 focus:border-grill-gold focus:outline-none text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Mobile Phone Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="0314 1915087"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-grill-dark border border-zinc-800 focus:border-grill-gold focus:outline-none text-white text-sm"
                  />
                </div>
              </div>
            </div>

            {/* WhatsApp option */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={usePhoneForWhatsApp}
                  onChange={(e) => setUsePhoneForWhatsApp(e.target.checked)}
                  className="accent-grill-gold"
                />
                <span>WhatsApp number is the same as my mobile number</span>
              </label>

              {!usePhoneForWhatsApp && (
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Different WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    placeholder="0300 1234567"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-grill-dark border border-zinc-800 focus:border-grill-gold focus:outline-none text-white text-sm"
                  />
                </div>
              )}
            </div>

            {/* Delivery address (if delivery) */}
            {orderType === 'delivery' && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Delivery Address <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <textarea
                      required
                      rows={2}
                      placeholder="House number, Street name, Mohalla, Area (e.g., House 14, Street 2, Baghbanpura)"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-grill-dark border border-zinc-800 focus:border-grill-gold focus:outline-none text-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Landmark / Address Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Sunny Pan Shop, Opposite Shell Pump"
                    value={addressNotes}
                    onChange={(e) => setAddressNotes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-grill-dark border border-zinc-800 focus:border-grill-gold focus:outline-none text-white text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Special Kitchen / Rider Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Extra mint raita please, make karahi spicy"
                value={customerInstructions}
                onChange={(e) => setCustomerInstructions(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-grill-dark border border-zinc-800 focus:border-grill-gold focus:outline-none text-white text-sm"
              />
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="p-6 rounded-3xl bg-grill-card border border-grill-border space-y-4">
            <h2 className="text-lg font-bold text-white font-heading">
              3. Select Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {!paymentSettingsLoaded && (
                <p className="sm:col-span-2 text-sm text-zinc-400">
                  Loading available payment methods...
                </p>
              )}
              {paymentSettingsLoaded &&
                (!paymentSettings ||
                  !(
                    isPaymentMethodAvailable(paymentSettings, 'cash_on_delivery') ||
                    isPaymentMethodAvailable(paymentSettings, 'easypaisa') ||
                    isPaymentMethodAvailable(paymentSettings, 'jazzcash') ||
                    isPaymentMethodAvailable(paymentSettings, 'bank_transfer')
                  )) && (
                  <p className="sm:col-span-2 text-sm text-amber-300">
                    Payment methods could not be loaded or are not configured. Please contact the restaurant.
                  </p>
                )}
              {/* Cash on Delivery */}
              {paymentSettings &&
                isPaymentMethodAvailable(paymentSettings, 'cash_on_delivery') && (
              <label
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'border-grill-gold bg-grill-gold/15 text-white'
                    : 'border-zinc-800 bg-grill-dark text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={() => setPaymentMethod('cash_on_delivery')}
                      className="accent-grill-gold"
                    />
                    <span className="font-bold text-sm text-white">Cash on Delivery</span>
                  </div>
                  <Banknote className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-xs text-zinc-400">
                  Pay cash to the rider upon delivery or at takeaway counter.
                </p>
              </label>
              )}

              {/* Easypaisa */}
              {paymentSettings &&
                isPaymentMethodAvailable(paymentSettings, 'easypaisa') && (
              <label
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                  paymentMethod === 'easypaisa'
                    ? 'border-emerald-500 bg-emerald-950/40 text-white'
                    : 'border-zinc-800 bg-grill-dark text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="easypaisa"
                      checked={paymentMethod === 'easypaisa'}
                      onChange={() => setPaymentMethod('easypaisa')}
                      className="accent-emerald-400"
                    />
                    <span className="font-bold text-sm text-white">Easypaisa</span>
                  </div>
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-xs text-zinc-400">
                  Direct transfer via Easypaisa App or mobile account.
                </p>
              </label>
              )}

              {/* JazzCash */}
              {paymentSettings &&
                isPaymentMethodAvailable(paymentSettings, 'jazzcash') && (
              <label
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                  paymentMethod === 'jazzcash'
                    ? 'border-red-500 bg-red-950/40 text-white'
                    : 'border-zinc-800 bg-grill-dark text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="jazzcash"
                      checked={paymentMethod === 'jazzcash'}
                      onChange={() => setPaymentMethod('jazzcash')}
                      className="accent-red-400"
                    />
                    <span className="font-bold text-sm text-white">JazzCash</span>
                  </div>
                  <CreditCard className="w-4 h-4 text-red-400" />
                </div>
                <p className="text-xs text-zinc-400">
                  Fast mobile transfer to GRILLVI JazzCash account.
                </p>
              </label>
              )}

              {/* Bank Transfer */}
              {paymentSettings &&
                isPaymentMethodAvailable(paymentSettings, 'bank_transfer') && (
              <label
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-blue-500 bg-blue-950/40 text-white'
                    : 'border-zinc-800 bg-grill-dark text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={() => setPaymentMethod('bank_transfer')}
                      className="accent-blue-400"
                    />
                    <span className="font-bold text-sm text-white">Bank Transfer</span>
                  </div>
                  <Building className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-xs text-zinc-400">
                  Online transfer to Meezan Bank Pakistan.
                </p>
              </label>
              )}
            </div>

            {/* Dynamic Payment Method Instructions & Slip Upload */}
            {paymentMethod !== 'cash_on_delivery' && paymentSettings && (
              <div className="mt-4 p-5 rounded-2xl bg-grill-dark border border-zinc-700 space-y-4">
                <div className="text-xs space-y-1.5">
                  <span className="font-bold text-grill-gold block uppercase tracking-wider">
                    Payment Instructions:
                  </span>
                  {paymentMethod === 'easypaisa' && (
                    <div className="space-y-1 text-zinc-200">
                      <p>
                        Account Title:{' '}
                        <strong>{paymentSettings.easypaisa.accountTitle}</strong>
                      </p>
                      <p>
                        Account / Mobile:{' '}
                        <strong className="font-mono text-emerald-400 text-sm">
                          {paymentSettings.easypaisa.accountNumber}
                        </strong>
                      </p>
                      <p className="text-zinc-400">{paymentSettings.easypaisa.instructions}</p>
                    </div>
                  )}

                  {paymentMethod === 'jazzcash' && (
                    <div className="space-y-1 text-zinc-200">
                      <p>
                        Account Title:{' '}
                        <strong>{paymentSettings.jazzcash.accountTitle}</strong>
                      </p>
                      <p>
                        Account / Mobile:{' '}
                        <strong className="font-mono text-red-400 text-sm">
                          {paymentSettings.jazzcash.accountNumber}
                        </strong>
                      </p>
                      <p className="text-zinc-400">{paymentSettings.jazzcash.instructions}</p>
                    </div>
                  )}

                  {paymentMethod === 'bank_transfer' && (
                    <div className="space-y-1 text-zinc-200">
                      <p>
                        Bank: <strong>{paymentSettings.bankTransfer.bankName}</strong>
                      </p>
                      <p>
                        Title: <strong>{paymentSettings.bankTransfer.accountTitle}</strong>
                      </p>
                      <p>
                        Account No:{' '}
                        <strong className="font-mono text-blue-400">
                          {paymentSettings.bankTransfer.accountNumber}
                        </strong>
                      </p>
                      <p>
                        IBAN:{' '}
                        <strong className="font-mono text-xs text-zinc-300">
                          {paymentSettings.bankTransfer.iban}
                        </strong>
                      </p>
                      <p className="text-zinc-400">{paymentSettings.bankTransfer.instructions}</p>
                    </div>
                  )}
                </div>

                {/* Reference ID input */}
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Transaction / Reference ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TRX19482910"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs font-mono"
                  />
                </div>

                {/* Screenshot Upload */}
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Upload Payment Screenshot / Receipt (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer py-2 px-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 flex items-center gap-2 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-grill-gold" />
                      <span>{receiptFile ? 'Change File' : 'Choose Receipt Image'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleReceiptUpload}
                        className="hidden"
                      />
                    </label>

                    {uploadingReceipt && (
                      <span className="text-xs text-zinc-400">Uploading...</span>
                    )}

                    {receiptUrl && (
                      <span className="text-xs text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Receipt Attached
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    * If you don&apos;t have the screenshot now, you can also send it to our WhatsApp after placing the order.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Review & Confirmation Action */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-grill-card border border-grill-border space-y-6 shadow-card">
            <h3 className="text-lg font-bold text-white font-heading pb-3 border-b border-grill-border">
              Order Review
            </h3>

            {/* Items summary */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div
                  key={`${item.menuItemId}-${item.variantId}-${idx}`}
                  className="flex items-center justify-between text-xs py-1"
                >
                  <div className="truncate pr-2">
                    <span className="font-semibold text-white">
                      {item.quantity}x {item.name}
                    </span>
                    {item.variantName && (
                      <span className="text-zinc-400 block text-[11px]">
                        ({item.variantName})
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-grill-gold flex-shrink-0">
                    {formatPKR(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Fees */}
            <div className="pt-4 border-t border-grill-border space-y-2 text-xs text-zinc-300">
              <div className="flex items-center justify-between">
                <span>Items Subtotal</span>
                <span className="font-mono font-semibold text-white">
                  {formatPKR(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery Fee</span>
                <span className="font-mono font-semibold text-white">
                  {orderType === 'takeaway'
                    ? 'Rs 0 (Takeaway)'
                    : isFreeDelivery
                    ? 'Free (Deal)'
                    : formatPKR(deliveryFee)}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-grill-border flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-400 uppercase">Total Payable</span>
                <p className="font-mono text-2xl font-black text-grill-gold">
                  {formatPKR(totalPayable)}
                </p>
              </div>
              <span className="text-[11px] text-zinc-400 capitalize">
                {paymentMethod.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={
                submitting ||
                !paymentSettingsLoaded ||
                !paymentSettings ||
                !isPaymentMethodAvailable(paymentSettings, paymentMethod)
              }
              className={`w-full py-4 rounded-xl font-bold text-sm shadow-orangeGlow transition-all flex items-center justify-center gap-2 ${
                submitting ||
                !paymentSettingsLoaded ||
                !paymentSettings ||
                !isPaymentMethodAvailable(paymentSettings, paymentMethod)
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-grill-orange to-grill-red hover:from-grill-orange-light hover:to-grill-red text-white active:scale-95'
              }`}
            >
              {submitting ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <span>Confirm & Place Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[11px] text-zinc-500 text-center leading-relaxed">
              By confirming, your order is safely registered in our database. You will also get a one-tap WhatsApp sync option.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
