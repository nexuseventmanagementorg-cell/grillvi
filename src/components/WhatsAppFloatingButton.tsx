'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, X } from 'lucide-react';
import { RESTAURANT_WHATSAPP_NUMBER } from '@/lib/whatsapp';
import { useCart } from '@/context/CartContext';

export default function WhatsAppFloatingButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  const pathname = usePathname();
  const { isCartOpen } = useCart();

  const normalizedPathname = pathname?.replace(/\/+$/, '');
  if (
    isCartOpen ||
    normalizedPathname?.startsWith('/checkout') ||
    normalizedPathname?.startsWith('/admin')
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-40 flex flex-col items-start">
      {/* Informational Callout Bubble */}
      {showTooltip && (
        <div className="mb-3 p-3 bg-grill-card border border-emerald-500/50 rounded-2xl shadow-2xl max-w-xs text-xs text-zinc-200 animate-in fade-in slide-in-from-bottom-2 duration-200 relative">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute top-2 right-2 text-zinc-400 hover:text-white"
            aria-label="Close tooltip"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="font-bold text-emerald-400 text-sm mb-1 flex items-center gap-1">
            <MessageCircle className="w-4 h-4" /> Quick WhatsApp Order
          </div>
          <p className="text-zinc-300 leading-snug">
            Need urgent takeaway, table booking, or customized catering? Chat directly with the GRILLVI chef team!
          </p>
          <p className="text-[11px] text-zinc-400 mt-1 italic">
            * Remember to hit Send once WhatsApp opens.
          </p>
        </div>
      )}

      {/* Main floating button */}
      <a
        href={`https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}?text=${encodeURIComponent(
          'Hello GRILLVI! I would like to place an order or inquire about tonight\'s menu.'
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold text-sm shadow-[0_4px_25px_rgba(16,185,129,0.5)] transition-all duration-300 transform hover:scale-105 active:scale-95"
        aria-label="Chat on WhatsApp"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-200"></span>
        </span>
        <MessageCircle className="w-5 h-5 fill-white transition-transform group-hover:rotate-12" />
        <span className="tracking-wide">Order on WhatsApp</span>
      </a>
    </div>
  );
}
