import type { Order } from '@/types';

const TABLE_NAME = 'grillvi_order_records';

interface StoredOrder {
  id: string;
  order_data: Order;
}

function getOrdersUrl(): string | null {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url && !serviceRoleKey) return null;
  if (!url || !serviceRoleKey) {
    throw new Error('Set both SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  return `${url.replace(/\/+$/, '')}/rest/v1/${TABLE_NAME}`;
}

function getHeaders(): Record<string, string> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured.');
  }

  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
  };
}

export async function readPersistentOrders(): Promise<Order[] | null> {
  const url = getOrdersUrl();
  if (!url) return null;

  const pageSize = 1000;
  const orders: Order[] = [];
  for (let offset = 0; ; offset += pageSize) {
    const query = new URLSearchParams({
      select: 'order_data',
      order: 'created_at.desc',
      limit: String(pageSize),
      offset: String(offset),
    });
    const response = await fetch(`${url}?${query}`, {
      headers: getHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Supabase orders read failed (${response.status}).`);
    }

    const rows = (await response.json()) as StoredOrder[];
    orders.push(...rows.map((row) => row.order_data));
    if (rows.length < pageSize) break;
  }

  return orders;
}

export async function readPersistentOrder(id: string): Promise<Order | null | undefined> {
  const url = getOrdersUrl();
  if (!url) return undefined;

  const query = new URLSearchParams({
    id: `eq.${id}`,
    select: 'order_data',
    limit: '1',
  });
  const response = await fetch(`${url}?${query}`, {
    headers: getHeaders(),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Supabase order read failed (${response.status}).`);
  }

  const rows = (await response.json()) as StoredOrder[];
  return rows[0]?.order_data ?? null;
}

export async function createPersistentOrder(order: Order): Promise<void> {
  const url = getOrdersUrl();
  if (!url) throw new Error('Supabase order persistence is not configured.');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      id: order.id,
      order_data: order,
      created_at: order.createdAt,
      updated_at: order.updatedAt,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Supabase order save failed (${response.status}).`);
  }
}

export async function updatePersistentOrder(order: Order): Promise<void> {
  const url = getOrdersUrl();
  if (!url) throw new Error('Supabase order persistence is not configured.');

  const query = new URLSearchParams({ id: `eq.${order.id}` });
  const response = await fetch(`${url}?${query}`, {
    method: 'PATCH',
    headers: {
      ...getHeaders(),
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      order_data: order,
      updated_at: order.updatedAt,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Supabase order update failed (${response.status}).`);
  }
}
