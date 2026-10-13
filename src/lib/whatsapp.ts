import { Order } from '@/types';
import { formatPKR } from './format';

export const RESTAURANT_WHATSAPP_NUMBER = '923141915087'; // Format for wa.me link

export function buildWhatsAppOrderMessage(order: Order): string {
  const itemsText = order.items
    .map((item, index) => {
      let line = `${index + 1}. ${item.name}`;
      if (item.variantName) {
        line += ` (${item.variantName})`;
      }
      line += ` x ${item.quantity} = ${formatPKR(item.subtotal)}`;
      if (item.addOns && item.addOns.length > 0) {
        line += `\n   + Add-ons: ${item.addOns.map((a) => a.name).join(', ')}`;
      }
      return line;
    })
    .join('\n');

  const paymentMethodLabel = {
    easypaisa: 'Easypaisa (Mobile Account)',
    jazzcash: 'JazzCash (Mobile Account)',
    bank_transfer: 'Bank Transfer (Meezan Bank)',
    cash_on_delivery: 'Cash on Delivery (COD)',
  }[order.paymentMethod] || order.paymentMethod;

  const orderTypeLabel = order.orderType === 'delivery' ? 'Home Delivery' : 'Takeaway / Self-Pickup';

  let message = `Hello GRILLVI! I would like to place an order.\n\n`;
  message += `Order ID: ${order.id}\n\n`;
  message += `Items:\n${itemsText}\n\n`;
  message += `Subtotal: ${formatPKR(order.subtotal)}\n`;
  message += `Delivery Fee: ${formatPKR(order.deliveryFee)}\n`;
  message += `Total Payable: ${formatPKR(order.totalAmount)}\n\n`;
  message += `Customer: ${order.customerName}\n`;
  message += `Phone: ${order.phone}\n`;
  if (order.whatsappNumber && order.whatsappNumber !== order.phone) {
    message += `WhatsApp: ${order.whatsappNumber}\n`;
  }
  message += `Order Type: ${orderTypeLabel}\n`;
  if (order.orderType === 'delivery' && order.deliveryAddress) {
    message += `Delivery Address: ${order.deliveryAddress}\n`;
  }
  if (order.addressNotes) {
    message += `Address Notes: ${order.addressNotes}\n`;
  }
  message += `Payment Method: ${paymentMethodLabel}\n`;
  if (order.customerInstructions) {
    message += `Special Instructions: ${order.customerInstructions}\n`;
  }
  message += `\nPlease confirm my order.`;

  return message;
}

export function buildWhatsAppLink(order: Order): string {
  const message = buildWhatsAppOrderMessage(order);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}?text=${encoded}`;
}

export function buildGeneralWhatsAppChatLink(customPrompt?: string): string {
  const text = customPrompt || 'Hello GRILLVI! I would like to inquire about your menu, dining reservation, and home delivery.';
  return `https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
