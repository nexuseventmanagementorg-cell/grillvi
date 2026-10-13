import { OrderItem, OrderItemAddOn } from '@/types';
import { getItemById, getPaymentSettings } from './db';
import { formatPKR } from './format';

export { formatPKR };

export interface ValidatedOrderCalculation {
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  errors: string[];
}

/**
 * Validates and recalculates order pricing strictly on the server
 * Never trusts prices submitted from client browser.
 */
export function calculateOrderPricing(
  submittedItems: Array<{
    menuItemId: string;
    variantId?: string;
    quantity: number;
    addOnIds?: string[];
  }>,
  orderType: 'delivery' | 'takeaway'
): ValidatedOrderCalculation {
  const errors: string[] = [];
  const paymentSettings = getPaymentSettings();
  const validatedItems: OrderItem[] = [];

  let subtotal = 0;

  if (!submittedItems || submittedItems.length === 0) {
    errors.push('Cart is empty. Please select at least one item.');
    return {
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      discount: 0,
      totalAmount: 0,
      errors,
    };
  }

  for (const itemRequest of submittedItems) {
    const menuItem = getItemById(itemRequest.menuItemId);
    if (!menuItem) {
      errors.push(`Menu item with ID "${itemRequest.menuItemId}" not found.`);
      continue;
    }

    if (!menuItem.isAvailable) {
      errors.push(`"${menuItem.name}" is currently sold out / unavailable.`);
      continue;
    }

    const qty = Math.max(1, Math.min(50, Math.floor(itemRequest.quantity || 1)));

    // Determine unit price based on selected variant or basePrice
    let unitPrice = menuItem.basePrice;
    let selectedVariantName: string | undefined = undefined;

    if (itemRequest.variantId && menuItem.variants && menuItem.variants.length > 0) {
      const variant = menuItem.variants.find((v) => v.id === itemRequest.variantId);
      if (variant) {
        unitPrice = variant.price;
        selectedVariantName = variant.name;
      }
    }

    // Determine add-on costs
    const selectedAddOns: OrderItemAddOn[] = [];
    let addOnsTotalPerUnit = 0;

    if (itemRequest.addOnIds && menuItem.addOns) {
      for (const addOnId of itemRequest.addOnIds) {
        const addOn = menuItem.addOns.find((a) => a.id === addOnId && a.isAvailable);
        if (addOn) {
          selectedAddOns.push({
            id: addOn.id,
            name: addOn.name,
            price: addOn.price,
          });
          addOnsTotalPerUnit += addOn.price;
        }
      }
    }

    const itemTotalPerUnit = unitPrice + addOnsTotalPerUnit;
    const lineSubtotal = itemTotalPerUnit * qty;

    subtotal += lineSubtotal;

    validatedItems.push({
      menuItemId: menuItem.id,
      name: menuItem.name,
      variantId: itemRequest.variantId,
      variantName: selectedVariantName,
      unitPrice: itemTotalPerUnit,
      quantity: qty,
      addOns: selectedAddOns,
      subtotal: lineSubtotal,
      image: menuItem.image,
    });
  }

  // Delivery fee calculation
  let deliveryFee = 0;
  if (orderType === 'delivery') {
    if (subtotal >= paymentSettings.freeDeliveryThreshold && paymentSettings.freeDeliveryThreshold > 0) {
      deliveryFee = 0;
    } else {
      deliveryFee = paymentSettings.defaultDeliveryFee;
    }
  }

  // Check minimum order value
  if (subtotal < paymentSettings.minOrderValue) {
    errors.push(
      `Minimum order value is ${formatPKR(paymentSettings.minOrderValue)}. Current subtotal: ${formatPKR(subtotal)}`
    );
  }

  const discount = 0;
  const totalAmount = subtotal + deliveryFee - discount;

  return {
    items: validatedItems,
    subtotal,
    deliveryFee,
    discount,
    totalAmount,
    errors,
  };
}
