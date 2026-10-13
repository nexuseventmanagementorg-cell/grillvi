'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Utensils } from 'lucide-react';
import { formatPKR } from '@/lib/format';

export default function CartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    isCartOpen,
    setIsCartOpen,
    subtotal,
    itemCount,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-grill-card border-l border-grill-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-grill-border flex items-center justify-between bg-grill-dark">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-grill-orange/20 text-grill-orange">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-heading">
                  Your Order Cart
                </h3>
                <p className="text-xs text-zinc-400">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} selected
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-zinc-400">
                <div className="w-16 h-16 rounded-full bg-zinc-800/80 flex items-center justify-center mb-4 text-zinc-500">
                  <Utensils className="w-8 h-8 text-grill-gold/40" />
                </div>
                <h4 className="text-white font-semibold text-base mb-1">
                  Your cart is empty
                </h4>
                <p className="text-xs text-zinc-400 max-w-xs mb-6">
                  Explore our live BBQ botis, sizzling karahis and royal Thaal platters!
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-grill-orange text-white text-xs font-bold hover:bg-grill-orange-light transition-colors"
                >
                  Browse Menu Now
                </button>
              </div>
            ) : (
              items.map((item, idx) => (
                <div
                  key={`${item.menuItemId}-${item.variantId || 'base'}-${idx}`}
                  className="p-3.5 rounded-xl bg-grill-dark border border-grill-border flex gap-3.5 items-start group hover:border-grill-gold/40 transition-colors"
                >
                  {/* Food Thumbnail */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-900 border border-zinc-800">
                    <Image
                      src={item.image || '/images/chicken-karahi.jpg'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-sm font-semibold text-white truncate">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeItem(item.menuItemId, item.variantId)}
                        className="text-zinc-500 hover:text-red-400 p-0.5 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {item.variantName && (
                      <span className="inline-block px-2 py-0.5 mt-0.5 rounded text-[10px] font-medium bg-grill-gold/15 text-grill-gold border border-grill-gold/30">
                        {item.variantName}
                      </span>
                    )}

                    {item.addOns && item.addOns.length > 0 && (
                      <p className="text-[11px] text-zinc-400 mt-1 truncate">
                        + {item.addOns.map((a) => a.name).join(', ')}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity controls */}
                      <div className="flex items-center border border-zinc-700 rounded-lg overflow-hidden bg-zinc-900">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.menuItemId,
                              item.variantId,
                              item.quantity - 1
                            )
                          }
                          className="px-2 py-1 text-zinc-300 hover:bg-zinc-800 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 py-1 text-xs font-mono font-bold text-white min-w-[24px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.menuItemId,
                              item.variantId,
                              item.quantity + 1
                            )
                          }
                          className="px-2 py-1 text-zinc-300 hover:bg-zinc-800 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line Subtotal */}
                      <span className="font-mono font-bold text-sm text-grill-gold">
                        {formatPKR(item.subtotal)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-grill-border bg-grill-dark space-y-3">
              <div className="flex items-center justify-between text-sm text-zinc-400">
                <span>Subtotal</span>
                <span className="font-mono font-semibold text-white text-base">
                  {formatPKR(subtotal)}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                * Delivery fee calculated at checkout based on location.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="py-3 px-4 rounded-xl text-center bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs border border-zinc-700 transition-colors"
                >
                  View Full Cart
                </Link>

                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="py-3 px-4 rounded-xl text-center bg-gradient-to-r from-grill-orange to-grill-red hover:from-grill-orange-light hover:to-grill-red text-white font-bold text-xs shadow-orangeGlow flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
