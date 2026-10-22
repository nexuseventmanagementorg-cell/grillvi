export type PaymentMethod = 'easypaisa' | 'jazzcash' | 'bank_transfer' | 'cash_on_delivery';

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled';

export type PaymentVerificationStatus =
  | 'pending_verification'
  | 'verified'
  | 'rejected'
  | 'cod';

export type OrderType = 'delivery' | 'takeaway';

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  role: 'admin' | 'manager';
  mustChangePassword?: boolean;
  lastLoginAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface MenuItemVariant {
  id: string;
  name: string; // e.g. "Half", "Full", "1 pc", "2 pc", "1 Litre"
  price: number;
  isDefault?: boolean;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface MenuItemImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary?: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categorySlug: string;
  description: string;
  basePrice: number;
  hasVariants?: boolean;
  variants?: MenuItemVariant[];
  addOns?: AddOn[];
  image: string;
  images?: MenuItemImage[];
  isAvailable: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  preparationTime?: string;
  qrCodeDataUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemAddOn {
  id: string;
  name: string;
  price: number;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  variantId?: string;
  variantName?: string;
  unitPrice: number;
  quantity: number;
  addOns: OrderItemAddOn[];
  subtotal: number;
  image?: string;
}

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  whatsappNumber?: string;
  orderType: OrderType;
  deliveryAddress?: string;
  addressNotes?: string;
  customerInstructions?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentVerificationStatus: PaymentVerificationStatus;
  paymentReceiptUrl?: string;
  paymentReference?: string;
  orderStatus: OrderStatus;
  statusHistory: OrderStatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface DailySalesReport {
  date: string;
  orderCount: number;
  revenue: number;
  averageOrderValue: number;
  completedOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  paymentBreakdown: Array<{
    method: PaymentMethod;
    orders: number;
    revenue: number;
  }>;
  topItems: Array<{ id: string; name: string; quantity: number; revenue: number }>;
  orders: Order[];
}

export interface PaymentAccountConfig {
  enabled: boolean;
  accountTitle: string;
  accountNumber: string;
  instructions: string;
}

export interface BankTransferConfig {
  enabled: boolean;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  instructions: string;
}

export interface CODConfig {
  enabled: boolean;
  instructions: string;
}

export interface PaymentSettings {
  easypaisa: PaymentAccountConfig;
  jazzcash: PaymentAccountConfig;
  bankTransfer: BankTransferConfig;
  cashOnDelivery: CODConfig;
  defaultDeliveryFee: number;
  freeDeliveryThreshold: number;
  minOrderValue: number;
  acceptingOrders: boolean;
}

export interface RestaurantSettings {
  name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  address: string;
  googleMapsPlusCode: string;
  googleMapsUrl: string;
  category: string;
  currency: string;
  openingHours: {
    days: string;
    dineIn: string;
    delivery: string;
  };
  deliveryAreas: string[];
  announcementBanner?: {
    enabled: boolean;
    text: string;
    badge?: string;
  };
  socialLinks: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
  };
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  dishRecommended?: string;
  source: 'google_historical' | 'customer_submitted';
  status: 'approved' | 'pending' | 'rejected';
  orderId?: string;
  createdAt: string;
}

export interface CartItem {
  menuItemId: string;
  name: string;
  image: string;
  variantId?: string;
  variantName?: string;
  unitPrice: number;
  quantity: number;
  addOns: OrderItemAddOn[];
  subtotal: number;
}
