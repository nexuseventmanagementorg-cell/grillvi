'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (
    item: Omit<CartItem, 'quantity' | 'subtotal'>,
    quantity?: number
  ) => void;
  removeItem: (menuItemId: string, variantId?: string) => void;
  updateQuantity: (
    menuItemId: string,
    variantId: string | undefined,
    quantity: number
  ) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'grillvi_cart_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not read cart from localStorage', e);
    }
    setHydrated(true);
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.warn('Could not write cart to localStorage', e);
      }
    }
  }, [items, hydrated]);

  const addItem = (
    itemData: Omit<CartItem, 'quantity' | 'subtotal'>,
    quantity = 1
  ) => {
    setItems((prev) => {
      // Find if same item with same variant already exists
      const existingIndex = prev.findIndex(
        (i) =>
          i.menuItemId === itemData.menuItemId &&
          (i.variantId || '') === (itemData.variantId || '')
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          subtotal: updated[existingIndex].unitPrice * newQty,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          ...itemData,
          quantity,
          subtotal: itemData.unitPrice * quantity,
        };
        return [...prev, newItem];
      }
    });

    setIsCartOpen(true);
  };

  const removeItem = (menuItemId: string, variantId?: string) => {
    setItems((prev) =>
      prev.filter(
        (i) =>
          !(
            i.menuItemId === menuItemId &&
            (i.variantId || '') === (variantId || '')
          )
      )
    );
  };

  const updateQuantity = (
    menuItemId: string,
    variantId: string | undefined,
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeItem(menuItemId, variantId);
      return;
    }

    setItems((prev) =>
      prev.map((i) => {
        if (
          i.menuItemId === menuItemId &&
          (i.variantId || '') === (variantId || '')
        ) {
          return {
            ...i,
            quantity,
            subtotal: i.unitPrice * quantity,
          };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((total, i) => total + i.quantity, 0);
  const subtotal = items.reduce((total, i) => total + i.subtotal, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
