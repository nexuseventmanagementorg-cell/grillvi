'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MenuItem, MenuItemVariant } from '@/types';
import { useCart } from '@/context/CartContext';
import { formatPKR } from '@/lib/format';
import {
  Plus,
  Flame,
  Clock,
  QrCode,
  Check,
  X,
  Download,
  ExternalLink,
} from 'lucide-react';

interface DishCardProps {
  item: MenuItem;
}

export default function DishCard({ item }: DishCardProps) {
  const { addItem } = useCart();
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<MenuItemVariant | null>(
    item.variants && item.variants.length > 0
      ? item.variants.find((v) => v.isDefault) || item.variants[0]
      : null
  );
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const hasVariants = item.hasVariants || (item.variants && item.variants.length > 0);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasVariants) {
      setIsVariantModalOpen(true);
      return;
    }

    addItem({
      menuItemId: item.id,
      name: item.name,
      image: item.image,
      unitPrice: item.basePrice,
      addOns: [],
    });

    triggerAddedFeedback();
  };

  const handleConfirmVariantAdd = () => {
    const unitPrice = selectedVariant ? selectedVariant.price : item.basePrice;

    const addOns = (item.addOns || [])
      .filter((a) => selectedAddOnIds.includes(a.id))
      .map((a) => ({ id: a.id, name: a.name, price: a.price }));

    const addOnsPrice = addOns.reduce((sum, a) => sum + a.price, 0);

    addItem(
      {
        menuItemId: item.id,
        name: item.name,
        image: item.image,
        variantId: selectedVariant?.id,
        variantName: selectedVariant?.name,
        unitPrice: unitPrice + addOnsPrice,
        addOns,
      },
      1
    );

    setIsVariantModalOpen(false);
    triggerAddedFeedback();
  };

  const triggerAddedFeedback = () => {
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const toggleAddOn = (id: string) => {
    setSelectedAddOnIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Determine display price string
  let displayPrice = formatPKR(item.basePrice);
  if (hasVariants && item.variants && item.variants.length > 0) {
    const minPrice = Math.min(...item.variants.map((v) => v.price));
    displayPrice = `From ${formatPKR(minPrice)}`;
  }

  return (
    <>
      <div className="group relative bg-grill-card rounded-2xl border border-grill-border hover:border-grill-gold/50 shadow-card hover:shadow-gold transition-all duration-300 flex flex-col overflow-hidden">
        {/* Food Image Container */}
        <Link href={`/menu/item/${item.id}`} className="relative h-48 sm:h-52 w-full overflow-hidden bg-zinc-900 block">
          <Image
            src={item.image || '/images/chicken-karahi.jpg'}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-108"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-grill-card via-transparent to-black/30" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {item.isPopular && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-grill-orange text-white shadow-md">
                <Flame className="w-3 h-3" /> Popular
              </span>
            )}
            {item.isFeatured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-grill-gold text-grill-black shadow-md">
                Chef Special
              </span>
            )}
            {!item.isAvailable && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-900/90 text-red-200 border border-red-700">
                Sold Out
              </span>
            )}
          </div>

          {/* Quick QR code button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsQrModalOpen(true);
            }}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-zinc-300 hover:text-grill-gold backdrop-blur-sm border border-zinc-700 transition-colors z-10"
            title="Scan or View QR Code"
            aria-label="View QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* Preparation time */}
          {item.preparationTime && (
            <div className="absolute bottom-2 left-3 flex items-center gap-1 text-[11px] text-zinc-300 font-medium bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-md">
              <Clock className="w-3 h-3 text-grill-gold" />
              <span>{item.preparationTime}</span>
            </div>
          )}
        </Link>

        {/* Content details */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <Link href={`/menu/item/${item.id}`} className="hover:text-grill-gold transition-colors">
                <h3 className="font-heading font-bold text-base sm:text-lg text-white leading-snug">
                  {item.name}
                </h3>
              </Link>
            </div>

            <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2 leading-relaxed mb-4">
              {item.description}
            </p>
          </div>

          {/* Price & Action button */}
          <div className="pt-3 border-t border-grill-border/60 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500 block">
                Price
              </span>
              <span className="text-base sm:text-lg font-mono font-bold text-grill-gold">
                {displayPrice}
              </span>
            </div>

            {item.isAvailable ? (
              <button
                onClick={handleQuickAdd}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 shadow-md ${
                  addedAnimation
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-grill-orange to-grill-red hover:from-grill-orange-light hover:to-grill-red text-white'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Added
                  </>
                ) : hasVariants ? (
                  <>Select Size</>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" /> Add
                  </>
                )}
              </button>
            ) : (
              <span className="text-xs font-semibold text-zinc-500 italic">Unavailable</span>
            )}
          </div>
        </div>
      </div>

      {/* Variant Selection Modal */}
      {isVariantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-grill-card border border-grill-border rounded-2xl p-6 shadow-2xl relative text-white">
            <button
              onClick={() => setIsVariantModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold font-heading mb-1">{item.name}</h3>
            <p className="text-xs text-zinc-400 mb-4">{item.description}</p>

            {/* Variants options */}
            {item.variants && item.variants.length > 0 && (
              <div className="mb-5">
                <label className="text-xs font-bold uppercase tracking-wider text-grill-gold block mb-2">
                  Select Portion / Size:
                </label>
                <div className="space-y-2">
                  {item.variants.map((variant) => (
                    <label
                      key={variant.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedVariant?.id === variant.id
                          ? 'border-grill-gold bg-grill-gold/15 text-white font-semibold'
                          : 'border-zinc-800 bg-grill-dark text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`variant-${item.id}`}
                          checked={selectedVariant?.id === variant.id}
                          onChange={() => setSelectedVariant(variant)}
                          className="accent-grill-gold"
                        />
                        <span className="text-sm">{variant.name}</span>
                      </div>
                      <span className="font-mono text-sm font-bold text-grill-gold">
                        {formatPKR(variant.price)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Add-ons options */}
            {item.addOns && item.addOns.length > 0 && (
              <div className="mb-6">
                <label className="text-xs font-bold uppercase tracking-wider text-grill-gold block mb-2">
                  Optional Add-ons:
                </label>
                <div className="space-y-2">
                  {item.addOns.map((addOn) => (
                    <label
                      key={addOn.id}
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                        selectedAddOnIds.includes(addOn.id)
                          ? 'border-grill-orange bg-grill-orange/15 text-white'
                          : 'border-zinc-800 bg-grill-dark text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedAddOnIds.includes(addOn.id)}
                          onChange={() => toggleAddOn(addOn.id)}
                          className="accent-grill-orange"
                        />
                        <span className="text-xs">{addOn.name}</span>
                      </div>
                      <span className="font-mono text-xs text-zinc-300">
                        +{formatPKR(addOn.price)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Total & Submit */}
            <div className="pt-4 border-t border-grill-border flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase">Subtotal</span>
                <p className="font-mono text-lg font-bold text-grill-gold">
                  {formatPKR(
                    (selectedVariant ? selectedVariant.price : item.basePrice) +
                      (item.addOns || [])
                        .filter((a) => selectedAddOnIds.includes(a.id))
                        .reduce((sum, a) => sum + a.price, 0)
                  )}
                </p>
              </div>

              <button
                onClick={handleConfirmVariantAdd}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-grill-orange to-grill-red hover:from-grill-orange-light hover:to-grill-red text-white text-xs font-bold shadow-orangeGlow transition-all text-center"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-grill-card border border-grill-border rounded-2xl p-6 shadow-2xl relative text-center text-white">
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs font-bold uppercase tracking-widest text-grill-gold block mb-1">
              RESTAURANT DIGITAL QR
            </span>
            <h3 className="text-lg font-bold font-heading mb-3">{item.name}</h3>

            {/* QR image */}
            <div className="bg-white p-4 rounded-xl inline-block mx-auto mb-3 shadow-lg">
              {item.qrCodeDataUrl ? (
                <img
                  src={item.qrCodeDataUrl}
                  alt={`QR Code for ${item.name}`}
                  className="w-48 h-48 mx-auto"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-zinc-800 text-xs font-medium">
                  Generating QR...
                </div>
              )}
            </div>

            <p className="text-xs text-zinc-400 mb-4">
              Scan this QR code with any mobile camera to view full dish details and order directly.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={`/api/qr/${item.id}?format=png`}
                download={`grillvi-${item.slug}.png`}
                className="py-2.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download PNG
              </a>

              <Link
                href={`/menu/item/${item.id}`}
                onClick={() => setIsQrModalOpen(false)}
                className="py-2.5 px-3 rounded-lg bg-grill-orange hover:bg-grill-orange-light text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Item Page
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
