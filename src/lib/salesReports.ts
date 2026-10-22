import type { DailySalesReport, Order, PaymentMethod } from '@/types';

export const SALES_TIME_ZONE = 'Asia/Karachi';

export function getBusinessDate(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: SALES_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

export function isOrderOnBusinessDate(order: Order, date: string): boolean {
  return getBusinessDate(new Date(order.createdAt)) === date;
}

const paymentMethods: PaymentMethod[] = [
  'cash_on_delivery',
  'easypaisa',
  'jazzcash',
  'bank_transfer',
];

export function createDailySalesReport(orders: Order[], date: string): DailySalesReport {
  const dailyOrders = orders.filter((order) => isOrderOnBusinessDate(order, date));
  const activeOrders = dailyOrders.filter((order) => order.orderStatus !== 'cancelled');
  const revenue = activeOrders.reduce((total, order) => total + order.totalAmount, 0);
  const paymentBreakdown = paymentMethods.map((method) => {
    const methodOrders = activeOrders.filter((order) => order.paymentMethod === method);
    return {
      method,
      orders: methodOrders.length,
      revenue: methodOrders.reduce((total, order) => total + order.totalAmount, 0),
    };
  });

  const items = new Map<string, { id: string; name: string; quantity: number; revenue: number }>();
  for (const order of activeOrders) {
    for (const item of order.items) {
      const entry = items.get(item.menuItemId) ?? {
        id: item.menuItemId,
        name: item.name,
        quantity: 0,
        revenue: 0,
      };
      entry.quantity += item.quantity;
      entry.revenue += item.subtotal;
      items.set(item.menuItemId, entry);
    }
  }

  return {
    date,
    orderCount: dailyOrders.length,
    revenue,
    averageOrderValue: activeOrders.length ? revenue / activeOrders.length : 0,
    completedOrders: dailyOrders.filter((order) => order.orderStatus === 'completed').length,
    cancelledOrders: dailyOrders.filter((order) => order.orderStatus === 'cancelled').length,
    pendingOrders: dailyOrders.filter(
      (order) => order.orderStatus !== 'completed' && order.orderStatus !== 'cancelled'
    ).length,
    paymentBreakdown,
    topItems: [...items.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 10),
    orders: dailyOrders,
  };
}

export function isValidReportDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}
