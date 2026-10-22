'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { formatPKR } from '@/lib/format';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  UtensilsCrossed,
  ShieldCheck,
} from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
          <ShoppingBag className="w-10 h-10 text-grill-gold/40" />
        </div>
        <h1 className="text-3xl font-black text-white font-heading">
          Your Cart is Currently Empty
        </h1>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">
          Explore our menu of live charcoal BBQ, sizzling karahis, and grand Thaal feasts to add dishes to your order.
        </p>
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-grill-orange to-grill-red text-white font-bold text-sm shadow-orangeGlow hover:from-grill-orange-light transition-all"
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Explore Full Menu</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-grill-border">
        <div>
          <h1 className="text-3xl font-black text-white font-heading">
            Your Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Review your selected dishes before proceeding to checkout.
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All Items</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, idx) => (
            <div
              key={`${item.menuItemId}-${item.variantId || 'base'}-${idx}`}
              className="p-4 sm:p-5 rounded-2xl bg-grill-card border border-grill-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 flex-shrink-0">
                  <Image
                    src={item.image || '/images/chicken-karahi.jpg'}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-heading">
                    {item.name}
                  </h3>
                  {item.variantName && (
                    <span className="inline-block px-2 py-0.5 mt-1 rounded text-[11px] font-medium bg-grill-gold/15 text-grill-gold border border-grill-gold/30">
                      Portion: {item.variantName}
                    </span>
                  )}
                  {item.addOns && item.addOns.length > 0 && (
                    <p className="text-xs text-zinc-400 mt-1">
                      Add-ons: {item.addOns.map((a) => a.name).join(', ')}
                    </p>
                  )}
                  <span className="font-mono text-xs text-zinc-400 block mt-1">
                    {formatPKR(item.unitPrice)} each
                  </span>
                </div>
              </div>

              {/* Quantity Controls & Line Total */}
              <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                <div className="flex items-center border border-zinc-700 rounded-xl overflow-hidden bg-zinc-900">
                  <button
                    onClick={() =>
                      updateQuantity(
                        item.menuItemId,
                        item.variantId,
                        item.quantity - 1
                      )
                    }
                    className="px-3 py-1.5 text-zinc-300 hover:bg-zinc-800 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 py-1.5 font-mono font-bold text-sm text-white min-w-[28px] text-center">
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
                    className="px-3 py-1.5 text-zinc-300 hover:bg-zinc-800 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="font-mono font-bold text-lg text-grill-gold">
                  {formatPKR(item.subtotal)}
                </span>

                <button
                  onClick={() => removeItem(item.menuItemId, item.variantId)}
                  className="text-zinc-500 hover:text-red-400 transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-xs font-bold text-grill-gold hover:underline pt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Add More Dishes from Menu</span>
          </Link>
        </div>

        {/* Order Summary Box */}
        <div className="p-6 rounded-3xl bg-grill-card border border-grill-border space-y-6 h-fit shadow-card">
          <h2 className="text-xl font-bold text-white font-heading pb-3 border-b border-grill-border">
            Order Summary
          </h2>

          <div className="space-y-3 text-sm text-zinc-300">
            <div className="flex items-center justify-between">
              <span>Items Total ({itemCount})</span>
              <span className="font-mono font-semibold text-white">
                {formatPKR(subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Estimated Delivery Fee</span>
              <span className="font-mono text-zinc-400 text-xs">
                Calculated at checkout
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-grill-border flex items-center justify-between">
            <span className="text-base font-bold text-white">Subtotal</span>
            <span className="font-mono text-2xl font-black text-grill-gold">
              {formatPKR(subtotal)}
            </span>
          </div>

          <Link
            href="/checkout"
            className="w-full py-4 rounded-xl bg-gradient-to-r from-grill-orange to-grill-red hover:from-grill-orange-light hover:to-grill-red text-white font-bold text-sm shadow-orangeGlow flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2 text-[11px] text-zinc-400 pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              Order confirmation and available payment methods.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
