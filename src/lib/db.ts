import fs from 'fs';
import path from 'path';
import {
  MenuItem,
  Category,
  Order,
  OrderStatus,
  PaymentVerificationStatus,
  RestaurantSettings,
  PaymentSettings,
  Review,
  AdminUser,
} from '@/types';
import {
  initialCategories,
  initialMenuItems,
  initialRestaurantSettings,
  initialPaymentSettings,
  initialReviews,
  getInitialAdminUser,
} from './initialData';

export interface DatabaseSchema {
  version: number;
  items: MenuItem[];
  categories: Category[];
  orders: Order[];
  reviews: Review[];
  restaurantSettings: RestaurantSettings;
  paymentSettings: PaymentSettings;
  admin: AdminUser;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'grillvi_db.json');

// Memory cache to accelerate Next.js App Router API requests and prevent redundant disk reads
let memoryCache: DatabaseSchema | null = null;

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
}

function loadDatabase(): DatabaseSchema {
  if (memoryCache) {
    return memoryCache;
  }

  ensureDataDir();

  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data: DatabaseSchema = JSON.parse(raw);
      memoryCache = data;
      return memoryCache;
    }
  } catch (err) {
    console.warn('Could not read existing database, initializing fresh database:', err);
  }

  // Initialize fresh database
  const newDb: DatabaseSchema = {
    version: 1,
    items: initialMenuItems,
    categories: initialCategories,
    orders: [],
    reviews: initialReviews,
    restaurantSettings: initialRestaurantSettings,
    paymentSettings: initialPaymentSettings,
    admin: getInitialAdminUser(),
  };

  saveDatabase(newDb);
  memoryCache = newDb;
  return memoryCache;
}

function saveDatabase(data: DatabaseSchema): void {
  ensureDataDir();
  memoryCache = data;

  try {
    const json = JSON.stringify(data, null, 2);
    const tempFile = path.join(DATA_DIR, `grillvi_db_${Date.now()}_tmp.json`);

    fs.writeFileSync(tempFile, json, 'utf-8');

    // Windows atomic rename fallback: try renameSync, fallback to copy + unlink
    try {
      fs.renameSync(tempFile, DB_FILE);
    } catch {
      fs.copyFileSync(tempFile, DB_FILE);
      try {
        fs.unlinkSync(tempFile);
      } catch {
        // ignore unlink error
      }
    }
  } catch (err) {
    console.error('Failed to save database to disk:', err);
  }
}

/* ============================================================
   MENU ITEMS CRUD
   ============================================================ */

export function getItems(options?: {
  category?: string;
  search?: string;
  featuredOnly?: boolean;
  availableOnly?: boolean;
}): MenuItem[] {
  const db = loadDatabase();
  let items = [...db.items];

  if (options?.category && options.category !== 'all') {
    items = items.filter(
      (item) => item.categorySlug === options.category || item.categoryId === options.category
    );
  }

  if (options?.search) {
    const q = options.search.toLowerCase().trim();
    items = items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.categorySlug.toLowerCase().includes(q)
    );
  }

  if (options?.featuredOnly) {
    items = items.filter((item) => item.isFeatured);
  }

  if (options?.availableOnly) {
    items = items.filter((item) => item.isAvailable);
  }

  return items;
}

export function getItemById(id: string): MenuItem | null {
  const db = loadDatabase();
  return db.items.find((item) => item.id === id || item.slug === id) || null;
}

export function createItem(
  itemData: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>
): MenuItem {
  const db = loadDatabase();
  const id = `gv-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newItem: MenuItem = {
    ...itemData,
    id,
    createdAt: now,
    updatedAt: now,
  };

  db.items.push(newItem);
  saveDatabase(db);
  return newItem;
}

export function updateItem(id: string, updates: Partial<MenuItem>): MenuItem | null {
  const db = loadDatabase();
  const index = db.items.findIndex((item) => item.id === id);
  if (index === -1) return null;

  db.items[index] = {
    ...db.items[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveDatabase(db);
  return db.items[index];
}

export function deleteItem(id: string): boolean {
  const db = loadDatabase();
  const initialLength = db.items.length;
  db.items = db.items.filter((item) => item.id !== id);
  if (db.items.length !== initialLength) {
    saveDatabase(db);
    return true;
  }
  return false;
}

/* ============================================================
   CATEGORIES CRUD
   ============================================================ */

export function getCategories(): Category[] {
  const db = loadDatabase();
  return [...db.categories].sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getCategoryById(id: string): Category | null {
  const db = loadDatabase();
  return db.categories.find((c) => c.id === id || c.slug === id) || null;
}

export function createCategory(cat: Omit<Category, 'id'>): Category {
  const db = loadDatabase();
  const id = `cat-${Date.now().toString(36)}`;
  const newCat: Category = {
    ...cat,
    id,
  };
  db.categories.push(newCat);
  saveDatabase(db);
  return newCat;
}

export function updateCategory(id: string, updates: Partial<Category>): Category | null {
  const db = loadDatabase();
  const index = db.categories.findIndex((c) => c.id === id);
  if (index === -1) return null;

  db.categories[index] = {
    ...db.categories[index],
    ...updates,
  };

  // If slug changed, update all items using this category
  if (updates.slug && updates.slug !== db.categories[index].slug) {
    db.items.forEach((item) => {
      if (item.categoryId === id) {
        item.categorySlug = updates.slug!;
      }
    });
  }

  saveDatabase(db);
  return db.categories[index];
}

export function deleteCategory(id: string): boolean {
  const db = loadDatabase();
  const initialLength = db.categories.length;
  db.categories = db.categories.filter((c) => c.id !== id);
  if (db.categories.length !== initialLength) {
    saveDatabase(db);
    return true;
  }
  return false;
}

/* ============================================================
   ORDERS CRUD & TRACKING
   ============================================================ */

export function getOrders(filters?: {
  status?: string;
  paymentMethod?: string;
  search?: string;
}): Order[] {
  const db = loadDatabase();
  let orders = [...db.orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (filters?.status && filters.status !== 'all') {
    orders = orders.filter((o) => o.orderStatus === filters.status);
  }

  if (filters?.paymentMethod && filters.paymentMethod !== 'all') {
    orders = orders.filter((o) => o.paymentMethod === filters.paymentMethod);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase().trim();
    orders = orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q)
    );
  }

  return orders;
}

export function getOrderById(id: string): Order | null {
  const db = loadDatabase();
  return db.orders.find((o) => o.id === id) || null;
}

export function createOrder(order: Order): Order {
  const db = loadDatabase();
  db.orders.unshift(order);
  saveDatabase(db);
  return order;
}

export function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  note?: string,
  updatedBy: string = 'admin'
): Order | null {
  const db = loadDatabase();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) return null;

  order.orderStatus = newStatus;
  order.updatedAt = new Date().toISOString();
  order.statusHistory.push({
    status: newStatus,
    timestamp: new Date().toISOString(),
    note: note || `Status updated to ${newStatus.replace(/_/g, ' ')}`,
    updatedBy,
  });

  saveDatabase(db);
  return order;
}

export function verifyPayment(
  orderId: string,
  status: PaymentVerificationStatus,
  note?: string
): Order | null {
  const db = loadDatabase();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) return null;

  order.paymentVerificationStatus = status;
  order.updatedAt = new Date().toISOString();

  // If verified and order status is placed, we can advance status to confirmed
  if (status === 'verified' && order.orderStatus === 'placed') {
    order.orderStatus = 'confirmed';
    order.statusHistory.push({
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      note: note || 'Payment verified by admin. Order confirmed.',
      updatedBy: 'admin',
    });
  }

  saveDatabase(db);
  return order;
}

/* ============================================================
   REVIEWS & RATINGS
   ============================================================ */

export function getReviews(approvedOnly: boolean = true): Review[] {
  const db = loadDatabase();
  let reviews = [...db.reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (approvedOnly) {
    reviews = reviews.filter((r) => r.status === 'approved');
  }

  return reviews;
}

export function createReview(
  data: Omit<Review, 'id' | 'createdAt' | 'status'>
): Review {
  const db = loadDatabase();
  const newReview: Review = {
    ...data,
    id: `rev-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    status: 'pending', // Requires admin approval
    createdAt: new Date().toISOString(),
  };

  db.reviews.unshift(newReview);
  saveDatabase(db);
  return newReview;
}

export function updateReviewStatus(
  id: string,
  status: 'approved' | 'rejected'
): Review | null {
  const db = loadDatabase();
  const review = db.reviews.find((r) => r.id === id);
  if (!review) return null;

  review.status = status;
  saveDatabase(db);
  return review;
}

export function deleteReview(id: string): boolean {
  const db = loadDatabase();
  const initialLength = db.reviews.length;
  db.reviews = db.reviews.filter((r) => r.id !== id);
  if (db.reviews.length !== initialLength) {
    saveDatabase(db);
    return true;
  }
  return false;
}

/* ============================================================
   SETTINGS MANAGEMENT
   ============================================================ */

export function getRestaurantSettings(): RestaurantSettings {
  const db = loadDatabase();
  return db.restaurantSettings;
}

export function updateRestaurantSettings(
  updates: Partial<RestaurantSettings>
): RestaurantSettings {
  const db = loadDatabase();
  db.restaurantSettings = {
    ...db.restaurantSettings,
    ...updates,
  };
  saveDatabase(db);
  return db.restaurantSettings;
}

export function getPaymentSettings(): PaymentSettings {
  const db = loadDatabase();
  return db.paymentSettings;
}

export function updatePaymentSettings(
  updates: Partial<PaymentSettings>
): PaymentSettings {
  const db = loadDatabase();
  db.paymentSettings = {
    ...db.paymentSettings,
    ...updates,
  };
  saveDatabase(db);
  return db.paymentSettings;
}

/* ============================================================
   ADMIN AUTHENTICATION & SECURITY
   ============================================================ */

export function getAdminUser(): AdminUser {
  const db = loadDatabase();
  return db.admin;
}

export function updateAdminPassword(newPasswordHash: string): boolean {
  const db = loadDatabase();
  db.admin.passwordHash = newPasswordHash;
  db.admin.mustChangePassword = false;
  saveDatabase(db);
  return true;
}

export function recordAdminLogin(): void {
  const db = loadDatabase();
  db.admin.lastLoginAt = new Date().toISOString();
  saveDatabase(db);
}

/* ============================================================
   ADMIN STATS & DASHBOARD METRICS
   ============================================================ */

export function getDashboardMetrics() {
  const db = loadDatabase();
  const now = new Date();
  const todayDateStr = now.toISOString().slice(0, 10);

  const totalOrders = db.orders.length;
  const todayOrders = db.orders.filter((o) =>
    o.createdAt.startsWith(todayDateStr)
  ).length;

  const pendingOrders = db.orders.filter(
    (o) => o.orderStatus === 'placed'
  ).length;
  const confirmedOrders = db.orders.filter(
    (o) => o.orderStatus === 'confirmed'
  ).length;
  const preparingOrders = db.orders.filter(
    (o) => o.orderStatus === 'preparing'
  ).length;
  const dispatchedOrders = db.orders.filter(
    (o) => o.orderStatus === 'out_for_delivery' || o.orderStatus === 'ready_for_pickup'
  ).length;
  const completedOrders = db.orders.filter(
    (o) => o.orderStatus === 'completed'
  ).length;
  const cancelledOrders = db.orders.filter(
    (o) => o.orderStatus === 'cancelled'
  ).length;

  const pendingPaymentVerifications = db.orders.filter(
    (o) => o.paymentVerificationStatus === 'pending_verification'
  ).length;

  const totalSales = db.orders
    .filter((o) => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Calculate best-selling items
  const itemCounts: Record<string, { name: string; count: number; revenue: number }> = {};
  db.orders.forEach((o) => {
    if (o.orderStatus !== 'cancelled') {
      o.items.forEach((item) => {
        if (!itemCounts[item.menuItemId]) {
          itemCounts[item.menuItemId] = {
            name: item.name,
            count: 0,
            revenue: 0,
          };
        }
        itemCounts[item.menuItemId].count += item.quantity;
        itemCounts[item.menuItemId].revenue += item.subtotal;
      });
    }
  });

  const topDishes = Object.values(itemCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const recentOrders = db.orders.slice(0, 8);

  return {
    totalOrders,
    todayOrders,
    pendingOrders,
    confirmedOrders,
    preparingOrders,
    dispatchedOrders,
    completedOrders,
    cancelledOrders,
    pendingPaymentVerifications,
    totalSales,
    topDishes,
    recentOrders,
    totalMenuItems: db.items.length,
    totalReviews: db.reviews.length,
    pendingReviews: db.reviews.filter((r) => r.status === 'pending').length,
  };
}
