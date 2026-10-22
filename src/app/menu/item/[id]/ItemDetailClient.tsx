'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MenuItem, MenuItemVariant } from '@/types';
import { useCart } from '@/context/CartContext';
import { formatPKR } from '@/lib/format';
import DishCard from '@/components/DishCard';
import {
  Plus,
  Minus,
  Check,
  QrCode,
  Download,
  Printer,
  Clock,
  Flame,
  ArrowRight,
  Share2,
} from 'lucide-react';

interface ItemDetailClientProps {
  item: MenuItem;
  qrDataUrl: string;
  productUrl: string;
  relatedDishes: MenuItem[];
}

export default function ItemDetailClient({
  item,
  qrDataUrl,
  productUrl,
  relatedDishes,
}: ItemDetailClientProps) {
  const { addItem } = useCart();

  const [selectedVariant, setSelectedVariant] = useState<MenuItemVariant | null>(
    item.variants && item.variants.length > 0
      ? item.variants.find((v) => v.isDefault) || item.variants[0]
      : null
  );
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const toggleAddOn = (id: string) => {
    setSelectedAddOnIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const currentUnitPrice =
    (selectedVariant ? selectedVariant.price : item.basePrice) +
    (item.addOns || [])
      .filter((a) => selectedAddOnIds.includes(a.id))
      .reduce((sum, a) => sum + a.price, 0);

  const totalCost = currentUnitPrice * quantity;

  const handleAddToCart = () => {
    const addOns = (item.addOns || [])
      .filter((a) => selectedAddOnIds.includes(a.id))
      .map((a) => ({ id: a.id, name: a.name, price: a.price }));

    addItem(
      {
        menuItemId: item.id,
        name: item.name,
        image: item.image,
        variantId: selectedVariant?.id,
        variantName: selectedVariant?.name,
        unitPrice: currentUnitPrice,
        addOns,
      },
      quantity
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(productUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrintLabel = () => {
    window.print();
  };

  return (
    <div className="space-y-16">
      {/* Main Two-Column Item Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left: Food Image */}
        <div className="space-y-4">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-zinc-900 border border-grill-border shadow-2xl">
            <Image
              src={item.image || '/images/chicken-karahi.jpg'}
              alt={item.name}
              fill
              priority
              className="object-cover"
            />
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {item.isPopular && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-grill-orange text-white shadow-md flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> Popular Choice
                </span>
              )}
              {item.isFeatured && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-grill-gold text-grill-black shadow-md">
                  Chef Recommendation
                </span>
              )}
            </div>
          </div>

          {/* Quick share button */}
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
            <span className="font-mono">Product ID: {item.id}</span>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 text-zinc-300 hover:text-grill-gold transition-colors font-medium"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copiedLink ? 'Link Copied!' : 'Share Product Link'}
            </button>
          </div>
        </div>

        {/* Right: Details & Order Controls */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-grill-gold">
              {item.categorySlug.replace(/-/g, ' ')}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white font-heading mt-1">
              {item.name}
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed mt-3">
              {item.description}
            </p>

            {item.preparationTime && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-3">
                <Clock className="w-3.5 h-3.5 text-grill-gold" />
                <span>Estimated Preparation: {item.preparationTime}</span>
              </div>
            )}
          </div>

          {/* Portion / Variant selector */}
          {item.variants && item.variants.length > 0 && (
            <div className="p-5 rounded-2xl bg-grill-card border border-grill-border space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-grill-gold block">
                Select Portion Size:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {item.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      selectedVariant?.id === v.id
                        ? 'border-grill-gold bg-grill-gold/15 text-white font-bold'
                        : 'border-zinc-800 bg-grill-dark text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-sm">{v.name}</span>
                    <span className="font-mono text-xs font-bold text-grill-gold">
                      {formatPKR(v.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons Selector */}
          {item.addOns && item.addOns.length > 0 && (
            <div className="p-5 rounded-2xl bg-grill-card border border-grill-border space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-grill-gold block">
                Recommended Add-ons & Sides:
              </label>
              <div className="space-y-2">
                {item.addOns.map((addOn) => (
                  <label
                    key={addOn.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                      selectedAddOnIds.includes(addOn.id)
                        ? 'border-grill-orange bg-grill-orange/15 text-white'
                        : 'border-zinc-800 bg-grill-dark text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={selectedAddOnIds.includes(addOn.id)}
                        onChange={() => toggleAddOn(addOn.id)}
                        className="accent-grill-orange rounded"
                      />
                      <span className="text-xs sm:text-sm font-medium">{addOn.name}</span>
                    </div>
                    <span className="font-mono text-xs text-grill-gold">
                      +{formatPKR(addOn.price)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Add to Cart Section */}
          <div className="p-5 rounded-2xl bg-grill-card border border-grill-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-zinc-400 uppercase">Unit Price</span>
                <p className="font-mono text-xl font-black text-grill-gold">
                  {formatPKR(currentUnitPrice)}
                </p>
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center border border-zinc-700 rounded-xl overflow-hidden bg-zinc-900">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-zinc-300 hover:bg-zinc-800 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 font-mono font-bold text-base text-white min-w-[36px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-zinc-300 hover:bg-zinc-800 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-zinc-400 uppercase">Total Amount</span>
                <p className="font-mono text-2xl font-black text-white">
                  {formatPKR(totalCost)}
                </p>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!item.isAvailable}
                className={`flex-1 py-4 px-6 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                  !item.isAvailable
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-grill-orange to-grill-red hover:from-grill-orange-light hover:to-grill-red text-white shadow-orangeGlow active:scale-95'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" /> Added to Your Cart
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" /> Add to Cart ({formatPKR(totalCost)})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AUTOMATIC QR CODE TOOLS SECTION */}
      <section className="p-8 rounded-3xl bg-grill-card border border-grill-border flex flex-col md:flex-row items-center gap-8 shadow-card">
        {/* QR Code Container (Printable Label) */}
        <div id="printable-qr-label" className="bg-white p-5 rounded-2xl shadow-xl text-center text-black flex flex-col items-center flex-shrink-0">
          <span className="text-[11px] font-black tracking-widest text-black uppercase mb-1">
            Restaurant Name
          </span>
          <img
            src={qrDataUrl}
            alt={`QR Code for ${item.name}`}
            className="w-44 h-44 object-contain"
          />
          <h4 className="font-heading font-black text-sm text-black mt-2 max-w-[170px] truncate">
            {item.name}
          </h4>
          <span className="font-mono font-bold text-xs text-grill-orange">
            {formatPKR(item.basePrice)}
          </span>
          <span className="text-[9px] text-zinc-600 mt-0.5">Scan to Order</span>
        </div>

        {/* QR Description & Admin/Customer Actions */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-grill-dark border border-grill-gold/30 text-xs font-bold text-grill-gold">
            <QrCode className="w-3.5 h-3.5" />
            <span>AUTHENTIC DIGITAL MENU QR CODE</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white font-heading">
            Table Standee & Delivery Bag QR Code
          </h3>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Every dish has its own product identifier and QR code. Print this label for table stands, takeaway bags, or flyers so guests can open this item, configure portions, and order online.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
            <a
              href={`/api/qr/${item.id}?format=png`}
              download={`restaurant-qr-${item.slug}.png`}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4 text-grill-gold" />
              <span>Download PNG</span>
            </a>

            <a
              href={`/api/qr/${item.id}?format=svg`}
              download={`grillvi-qr-${item.slug}.svg`}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4 text-grill-gold" />
              <span>Download SVG</span>
            </a>

            <button
              onClick={handlePrintLabel}
              className="px-4 py-2.5 rounded-xl bg-grill-card hover:bg-zinc-800 text-white text-xs font-bold border border-grill-gold/40 flex items-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4 text-grill-gold" />
              <span>Print QR Label</span>
            </button>
          </div>
        </div>
      </section>

      {/* RELATED DISHES SECTION */}
      {relatedDishes.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white font-heading">
              More from {item.categorySlug.replace(/-/g, ' ')}
            </h3>
            <Link
              href={`/menu?category=${item.categorySlug}`}
              className="text-xs font-bold text-grill-gold hover:underline flex items-center gap-1"
            >
              <span>View All</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedDishes.map((relItem) => (
              <DishCard key={relItem.id} item={relItem} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
