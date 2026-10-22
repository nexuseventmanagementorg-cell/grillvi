'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  MenuItem,
  Category,
  Order,
  OrderStatus,
  PaymentVerificationStatus,
  PaymentSettings,
  RestaurantSettings,
  Review,
  DailySalesReport,
} from '@/types';
import { formatPKR } from '@/lib/format';
import { getBusinessDate, SALES_TIME_ZONE } from '@/lib/salesReports';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  CalendarDays,
  QrCode,
  CreditCard,
  Settings,
  Star,
  LogOut,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Printer,
  Upload,
  Download,
  ExternalLink,
  Edit,
  Trash2,
  Eye,
  KeyRound,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();

  // Authentication State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'daily-sales' | 'orders' | 'menu' | 'qr' | 'payments' | 'settings' | 'reviews'
  >('overview');

  // Data States
  const [metrics, setMetrics] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [savingPaymentSettings, setSavingPaymentSettings] = useState(false);
  const [restaurantSettings, setRestaurantSettings] = useState<RestaurantSettings | null>(null);

  // UI / Filter States
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [reportDate, setReportDate] = useState(() => getBusinessDate(new Date()));
  const [dailyReport, setDailyReport] = useState<DailySalesReport | null>(null);
  const [dailyReportLoading, setDailyReportLoading] = useState(false);
  const [dailyReportError, setDailyReportError] = useState('');
  const [reportRefreshKey, setReportRefreshKey] = useState(0);

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Check Admin Session
  useEffect(() => {
    async function verifyAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.replace('/admin/login');
          return;
        }
        const data = await res.json();
        setCurrentUser(data.user);
        loadAllData();
      } catch {
        router.replace('/admin/login');
      } finally {
        setAuthLoading(false);
      }
    }
    verifyAuth();
  }, [router]);

  useEffect(() => {
    if (activeTab !== 'daily-sales') return;

    let current = true;
    setDailyReportLoading(true);
    setDailyReportError('');

    fetch(`/api/admin/sales?date=${encodeURIComponent(reportDate)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load sales report.');
        return data.report as DailySalesReport;
      })
      .then((report) => {
        if (current) setDailyReport(report);
      })
      .catch((error: unknown) => {
        if (current) {
          setDailyReportError(
            error instanceof Error ? error.message : 'Failed to load sales report.'
          );
          setDailyReport(null);
        }
      })
      .finally(() => {
        if (current) setDailyReportLoading(false);
      });

    return () => {
      current = false;
    };
  }, [activeTab, reportDate, reportRefreshKey]);

  const loadAllData = async () => {
    try {
      const [metricsRes, ordersRes, menuRes, catsRes, reviewsRes, payRes, restRes] =
        await Promise.all([
          fetch('/api/admin/metrics'),
          fetch('/api/orders'),
          fetch('/api/menu/items'),
          fetch('/api/menu/categories'),
          fetch('/api/reviews?all=true'),
          fetch('/api/settings/payment'),
          fetch('/api/settings/restaurant'),
        ]);

      const [metricsData, ordersData, menuData, catsData, reviewsData, payData, restData] =
        await Promise.all([
          metricsRes.json(),
          ordersRes.json(),
          menuRes.json(),
          catsRes.json(),
          reviewsRes.json(),
          payRes.json(),
          restRes.json(),
        ]);

      if (metricsData.metrics) setMetrics(metricsData.metrics);
      if (ordersData.orders) setOrders(ordersData.orders);
      if (menuData.items) setMenuItems(menuData.items);
      if (catsData.categories) setCategories(catsData.categories);
      if (reviewsData.reviews) setReviews(reviewsData.reviews);
      if (payData.settings) setPaymentSettings(payData.settings);
      if (restData.settings) setRestaurantSettings(restData.settings);
    } catch (e) {
      console.error('Error fetching admin data:', e);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const exportDailySalesCsv = () => {
    if (!dailyReport) return;

    const escapeCsv = (value: string | number) => {
      let text = String(value);
      if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
      return `"${text.replace(/"/g, '""')}"`;
    };
    const rows = [
      [
        'Order ID',
        'Time (Pakistan)',
        'Customer',
        'Order Type',
        'Items',
        'Order Status',
        'Payment Method',
        'Payment Status',
        'Total (PKR)',
      ],
      ...dailyReport.orders.map((order) => [
        order.id,
        new Intl.DateTimeFormat('en-PK', {
          dateStyle: 'short',
          timeStyle: 'short',
          timeZone: SALES_TIME_ZONE,
        }).format(new Date(order.createdAt)),
        order.customerName,
        order.orderType,
        order.items.map((item) => `${item.name} x${item.quantity}`).join('; '),
        order.orderStatus,
        order.paymentMethod,
        order.paymentVerificationStatus,
        order.totalAmount,
      ]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(escapeCsv).join(',')).join('\r\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `grillvi-daily-sales-${dailyReport.date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Order Actions
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.order) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
        if (selectedOrder?.id === orderId) setSelectedOrder(data.order);
        showToast(`Order status updated to ${newStatus.replace(/_/g, ' ')}`);
        // Refresh metrics
        const mRes = await fetch('/api/admin/metrics');
        const mData = await mRes.json();
        if (mData.metrics) setMetrics(mData.metrics);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerifyPayment = async (
    orderId: string,
    status: PaymentVerificationStatus
  ) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentVerificationStatus: status }),
      });
      const data = await res.json();
      if (data.order) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
        if (selectedOrder?.id === orderId) setSelectedOrder(data.order);
        showToast(`Payment marked as ${status}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Dish Actions
  const handleToggleDishAvailability = async (item: MenuItem) => {
    try {
      const res = await fetch(`/api/menu/items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });
      const data = await res.json();
      if (data.item) {
        setMenuItems((prev) => prev.map((i) => (i.id === item.id ? data.item : i)));
        showToast(
          `"${item.name}" marked as ${data.item.isAvailable ? 'Available' : 'Sold Out'}`
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteDish = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      const res = await fetch(`/api/menu/items/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        setMenuItems((prev) => prev.filter((i) => i.id !== itemId));
        showToast('Dish deleted successfully.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Review Actions
  const handleReviewStatus = async (
    reviewId: string,
    status: 'approved' | 'rejected'
  ) => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.review) {
        setReviews((prev) => prev.map((r) => (r.id === reviewId ? data.review : r)));
        showToast(`Review ${status}.`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Delete this review permanently?')) return;
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        showToast('Review deleted.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grill-black text-zinc-400">
        Authenticating GRILLVI Admin Portal...
      </div>
    );
  }

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter;
    const matchesSearch =
      orderSearch === '' ||
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.phone.includes(orderSearch);
    return matchesStatus && matchesSearch;
  });

  // Filtered Menu Items
  const filteredMenuItems = menuItems.filter((i) => {
    const matchesCategory =
      menuCategoryFilter === 'all' ||
      i.categorySlug === menuCategoryFilter ||
      i.categoryId === menuCategoryFilter;
    const matchesSearch =
      menuSearch === '' ||
      i.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
      i.description.toLowerCase().includes(menuSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-grill-black text-zinc-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-grill-card border border-grill-gold/60 text-white text-xs font-semibold shadow-2xl animate-in slide-in-from-top-2 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Top Navigation Bar */}
      <div className="bg-grill-dark border-b border-grill-border px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9">
            <Image
              src="/images/grillvi-logo.png"
              alt="GRILLVI Logo"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-base font-bold text-white font-heading">
              GRILLVI Admin Suite
            </h1>
            <span className="text-[10px] text-grill-gold uppercase tracking-wider font-semibold">
              Live Operations & Management {currentUser?.username ? `• ${currentUser.username}` : ''}
            </span>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:gap-3">
          <Link
            href="/"
            target="_blank"
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Website</span>
          </Link>

          <button
            onClick={() => {
              setEditingDish(null);
              setIsDishModalOpen(true);
            }}
            className="shrink-0 whitespace-nowrap px-3 py-2 rounded-lg bg-gradient-to-r from-grill-orange to-grill-red hover:from-grill-orange-light text-sm font-semibold text-white flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>

          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 flex items-center gap-1.5 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-grill-gold" />
            <span className="hidden sm:inline">Change Password</span>
          </button>

          <button
            onClick={handleLogout}
            aria-label="Sign out of admin"
            className="shrink-0 whitespace-nowrap px-3 py-2 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-700 text-sm font-semibold text-red-200 flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-grill-card/60 border-b border-grill-border px-4 sm:px-6 lg:px-8 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max py-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-grill-gold text-grill-black shadow-gold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview & Sales</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-grill-gold text-grill-black shadow-gold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Live Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('daily-sales')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'daily-sales'
                ? 'bg-grill-gold text-grill-black shadow-gold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Daily Sales</span>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'menu'
                ? 'bg-grill-gold text-grill-black shadow-gold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Menu & Prices ({menuItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'qr'
                ? 'bg-grill-gold text-grill-black shadow-gold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR Code Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'payments'
                ? 'bg-grill-gold text-grill-black shadow-gold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payment Accounts</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'bg-grill-gold text-grill-black shadow-gold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Reviews Moderation ({reviews.filter((r) => r.status === 'pending').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-grill-gold text-grill-black shadow-gold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Restaurant Settings</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ========================================================
            TAB 1: OVERVIEW & ANALYTICS
           ======================================================== */}
        {activeTab === 'overview' && metrics && (
          <div className="space-y-8">
            {/* Top Metric Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
              <div className="p-5 rounded-2xl bg-grill-card border border-grill-border space-y-1">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase">
                  Today&apos;s Orders
                </span>
                <p className="text-2xl font-black text-white font-mono">
                  {metrics.todayOrders}
                </p>
                <span className="text-[10px] text-zinc-500">Pakistan local date</span>
              </div>

              <div className="p-5 rounded-2xl bg-grill-card border border-grill-border space-y-1">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase">
                  Today&apos;s Revenue
                </span>
                <p className="text-2xl font-black text-grill-gold font-mono">
                  {formatPKR(metrics.todayRevenue)}
                </p>
                <span className="text-[10px] text-zinc-500">Cancelled orders excluded</span>
              </div>

              <div className="p-5 rounded-2xl bg-grill-card border border-grill-border space-y-1">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase">
                  Action Needed
                </span>
                <p className="text-2xl font-black text-amber-400 font-mono">
                  {metrics.actionNeededOrders}
                </p>
                <span className="text-[10px] text-zinc-500">
                  {metrics.pendingPaymentVerifications} payment verification(s)
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-grill-card border border-grill-border space-y-1">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase">
                  Completed Today
                </span>
                <p className="text-2xl font-black text-emerald-400 font-mono">
                  {metrics.completedToday}
                </p>
                <span className="text-[10px] text-zinc-500">Successfully fulfilled</span>
              </div>

              <div className="p-5 rounded-2xl bg-grill-card border border-grill-border space-y-1">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase">
                  Total Revenue
                </span>
                <p className="text-2xl font-black text-white font-mono">
                  {formatPKR(metrics.totalSales)}
                </p>
                <span className="text-[10px] text-zinc-500">All time, excluding cancelled</span>
              </div>
            </div>

            {/* Status Breakdown Bar */}
            <div className="p-6 rounded-2xl bg-grill-card border border-grill-border space-y-3">
              <h3 className="text-sm font-bold text-white font-heading">
                Order Pipeline Breakdown
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs text-center">
                <div className="p-3 rounded-xl bg-grill-dark border border-zinc-800">
                  <span className="text-zinc-400 block text-[10px]">Placed</span>
                  <strong className="text-base font-mono text-white">
                    {metrics.pendingOrders}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-grill-dark border border-zinc-800">
                  <span className="text-zinc-400 block text-[10px]">Confirmed</span>
                  <strong className="text-base font-mono text-white">
                    {metrics.confirmedOrders}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-grill-dark border border-zinc-800">
                  <span className="text-zinc-400 block text-[10px]">Preparing</span>
                  <strong className="text-base font-mono text-grill-orange">
                    {metrics.preparingOrders}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-grill-dark border border-zinc-800">
                  <span className="text-zinc-400 block text-[10px]">Dispatched / Ready</span>
                  <strong className="text-base font-mono text-blue-400">
                    {metrics.dispatchedOrders}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-grill-dark border border-zinc-800">
                  <span className="text-zinc-400 block text-[10px]">Completed</span>
                  <strong className="text-base font-mono text-emerald-400">
                    {metrics.completedOrders}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-grill-dark border border-zinc-800">
                  <span className="text-zinc-400 block text-[10px]">Cancelled</span>
                  <strong className="text-base font-mono text-red-400">
                    {metrics.cancelledOrders}
                  </strong>
                </div>
              </div>
            </div>

            {/* Best-selling Dishes and Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Dishes */}
              <div className="p-6 rounded-2xl bg-grill-card border border-grill-border space-y-4">
                <h3 className="text-sm font-bold text-white font-heading">
                  Best-Selling Specialties
                </h3>
                {metrics.topDishes.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-6 text-center">
                    Order history will show top selling dishes here.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {metrics.topDishes.map((dish: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-grill-dark border border-zinc-800 text-xs"
                      >
                        <span className="font-semibold text-white truncate max-w-[150px]">
                          {dish.name}
                        </span>
                        <div className="text-right">
                          <span className="font-mono text-grill-gold font-bold">
                            {dish.count} sold
                          </span>
                          <span className="text-[10px] text-zinc-500 block">
                            {formatPKR(dish.revenue)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Orders List */}
              <div className="lg:col-span-2 p-6 rounded-2xl bg-grill-card border border-grill-border space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white font-heading">
                    Recent Orders
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-grill-gold hover:underline"
                  >
                    View All Orders
                  </button>
                </div>

                <div className="space-y-2.5 overflow-x-auto">
                  {orders.slice(0, 5).map((ord) => (
                    <div
                      key={ord.id}
                      onClick={() => setSelectedOrder(ord)}
                      className="p-3 rounded-xl bg-grill-dark border border-zinc-800 hover:border-grill-gold/40 cursor-pointer flex items-center justify-between gap-4 text-xs transition-colors"
                    >
                      <div>
                        <span className="font-mono font-bold text-white block">
                          {ord.id}
                        </span>
                        <span className="text-zinc-400">
                          {ord.customerName} ({ord.phone})
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-grill-gold block">
                          {formatPKR(ord.totalAmount)}
                        </span>
                        <span className="text-[10px] capitalize px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                          {ord.orderStatus.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: DAILY SALES REPORT
           ======================================================== */}
        {activeTab === 'daily-sales' && (
          <div id="daily-sales-print" className="space-y-6">
            <div className="flex flex-col gap-4 rounded-2xl border border-grill-border bg-grill-card p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-heading text-xl font-bold text-white">Daily Sales Report</h2>
                <p className="mt-1 text-xs text-zinc-400">
                  Sales and orders are grouped by Pakistan Standard Time. Cancelled orders are
                  excluded from revenue.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 print:hidden">
                <label htmlFor="daily-sales-date" className="text-xs font-semibold text-zinc-300">
                  Report date
                </label>
                <input
                  id="daily-sales-date"
                  type="date"
                  value={reportDate}
                  max={getBusinessDate(new Date())}
                  onChange={(event) => setReportDate(event.target.value)}
                  className="rounded-lg border border-zinc-700 bg-grill-dark px-3 py-2 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => setReportRefreshKey((value) => value + 1)}
                  disabled={dailyReportLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-700 disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${dailyReportLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={exportDailySalesCsv}
                  disabled={!dailyReport || dailyReportLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-grill-gold px-3 py-2 text-xs font-bold text-grill-black hover:brightness-110 disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  disabled={!dailyReport || dailyReportLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-700 disabled:opacity-50"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print
                </button>
              </div>
            </div>

            {dailyReportError && (
              <div role="alert" className="rounded-xl border border-red-800 bg-red-950/60 p-4 text-sm text-red-200">
                {dailyReportError}
              </div>
            )}

            {dailyReportLoading && !dailyReport ? (
              <div className="rounded-2xl border border-grill-border bg-grill-card p-10 text-center text-sm text-zinc-400">
                Loading daily sales report…
              </div>
            ) : dailyReport ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
                  {[
                    { label: 'Orders', value: dailyReport.orderCount, detail: `${dailyReport.completedOrders} completed` },
                    { label: 'Net Sales', value: formatPKR(dailyReport.revenue), detail: 'Cancelled orders excluded' },
                    { label: 'Average Order', value: formatPKR(dailyReport.averageOrderValue), detail: 'Per non-cancelled order' },
                    { label: 'Pending', value: dailyReport.pendingOrders, detail: 'Awaiting completion' },
                    { label: 'Cancelled', value: dailyReport.cancelledOrders, detail: 'Not included in sales' },
                  ].map((metric) => (
                    <div key={metric.label} className="rounded-2xl border border-grill-border bg-grill-card p-5">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">{metric.label}</span>
                      <p className="mt-2 break-words font-mono text-xl font-black text-white">{metric.value}</p>
                      <span className="mt-1 block text-[10px] text-zinc-500">{metric.detail}</span>
                    </div>
                  ))}
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                  <section className="rounded-2xl border border-grill-border bg-grill-card p-5">
                    <h3 className="mb-4 flex items-center gap-2 font-heading text-sm font-bold text-white">
                      <CreditCard className="h-4 w-4 text-grill-gold" />
                      Sales by Payment Method
                    </h3>
                    <div className="space-y-3">
                      {dailyReport.paymentBreakdown.map((entry) => (
                        <div key={entry.method} className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-3 last:border-0 last:pb-0">
                          <div>
                            <p className="text-xs font-semibold capitalize text-zinc-200">
                              {entry.method.replace(/_/g, ' ')}
                            </p>
                            <p className="mt-1 text-[10px] text-zinc-500">{entry.orders} order(s)</p>
                          </div>
                          <span className="font-mono text-sm font-bold text-grill-gold">{formatPKR(entry.revenue)}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-grill-border bg-grill-card p-5">
                    <h3 className="mb-4 flex items-center gap-2 font-heading text-sm font-bold text-white">
                      <TrendingUp className="h-4 w-4 text-grill-gold" />
                      Best-Selling Items
                    </h3>
                    {dailyReport.topItems.length === 0 ? (
                      <p className="py-5 text-center text-xs text-zinc-500">No non-cancelled sales on this date.</p>
                    ) : (
                      <div className="space-y-3">
                        {dailyReport.topItems.map((item, index) => (
                          <div key={item.id} className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-3 last:border-0 last:pb-0">
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-grill-gold">{index + 1}</span>
                              <span className="truncate text-xs font-semibold text-white">{item.name}</span>
                            </div>
                            <div className="shrink-0 text-right">
                              <span className="block text-xs font-bold text-zinc-200">{item.quantity} sold</span>
                              <span className="font-mono text-[10px] text-grill-gold">{formatPKR(item.revenue)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>

                <section className="overflow-hidden rounded-2xl border border-grill-border bg-grill-card">
                  <div className="flex items-center justify-between border-b border-grill-border p-5">
                    <div>
                      <h3 className="font-heading text-sm font-bold text-white">Orders for {dailyReport.date}</h3>
                      <p className="mt-1 text-[10px] text-zinc-500">{dailyReport.orderCount} order(s)</p>
                    </div>
                    <CalendarDays className="h-5 w-5 text-grill-gold" />
                  </div>
                  {dailyReport.orders.length === 0 ? (
                    <p className="p-8 text-center text-xs text-zinc-500">No orders recorded for this date.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[760px] text-left text-xs">
                        <thead className="bg-grill-dark text-[10px] uppercase text-zinc-400">
                          <tr>
                            <th className="p-3">Order</th>
                            <th className="p-3">Time (PKT)</th>
                            <th className="p-3">Customer</th>
                            <th className="p-3">Items</th>
                            <th className="p-3">Payment</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                          {dailyReport.orders.map((order) => (
                            <tr key={order.id} className="text-zinc-300">
                              <td className="p-3 font-mono font-bold text-white">{order.id}</td>
                              <td className="p-3">{new Intl.DateTimeFormat('en-PK', { hour: 'numeric', minute: '2-digit', timeZone: SALES_TIME_ZONE }).format(new Date(order.createdAt))}</td>
                              <td className="p-3">{order.customerName}</td>
                              <td className="p-3">{order.items.reduce((total, item) => total + item.quantity, 0)}</td>
                              <td className="p-3 capitalize">{order.paymentMethod.replace(/_/g, ' ')}</td>
                              <td className="p-3">
                                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold capitalize ${
                                  order.orderStatus === 'cancelled'
                                    ? 'bg-red-950 text-red-300'
                                    : order.orderStatus === 'completed'
                                    ? 'bg-emerald-950 text-emerald-300'
                                    : 'bg-zinc-800 text-zinc-300'
                                }`}>
                                  {order.orderStatus.replace(/_/g, ' ')}
                                </span>
                              </td>
                              <td className="p-3 text-right font-mono font-bold text-grill-gold">{formatPKR(order.totalAmount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </div>
            ) : null}
            <style jsx global>{`
              @media print {
                body * {
                  visibility: hidden !important;
                }

                #daily-sales-print,
                #daily-sales-print * {
                  visibility: visible !important;
                }

                #daily-sales-print {
                  position: absolute;
                  inset: 0;
                  width: 100%;
                  background: #fff !important;
                  color: #111 !important;
                }

                #daily-sales-print * {
                  border-color: #ddd !important;
                  background: transparent !important;
                  box-shadow: none !important;
                  color: #111 !important;
                }
              }
            `}</style>
          </div>
        )}

        {/* ========================================================
            TAB 3: ORDER MANAGEMENT
           ======================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Search & Status Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-grill-card border border-grill-border">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search order ID, name, phone..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-grill-dark border border-zinc-800 text-white text-xs focus:border-grill-gold focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <Filter className="w-4 h-4 text-zinc-500" />
                {[
                  { key: 'all', label: 'All' },
                  { key: 'placed', label: 'Placed' },
                  { key: 'confirmed', label: 'Confirmed' },
                  { key: 'preparing', label: 'Preparing' },
                  { key: 'out_for_delivery', label: 'Out' },
                  { key: 'completed', label: 'Completed' },
                  { key: 'cancelled', label: 'Cancelled' },
                ].map((st) => (
                  <button
                    key={st.key}
                    onClick={() => setOrderStatusFilter(st.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      orderStatusFilter === st.key
                        ? 'bg-grill-gold text-grill-black'
                        : 'bg-zinc-800 text-zinc-300 hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="rounded-2xl bg-grill-card border border-grill-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-grill-dark text-zinc-400 font-semibold border-b border-grill-border">
                    <tr>
                      <th className="p-3.5">Order ID</th>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">Type & Items</th>
                      <th className="p-3.5">Total</th>
                      <th className="p-3.5">Payment</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-zinc-500">
                          No orders found matching the filter.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr
                          key={ord.id}
                          className="hover:bg-grill-dark/50 transition-colors"
                        >
                          <td className="p-3.5 font-mono font-bold text-white">
                            {ord.id}
                            <span className="block text-[10px] text-zinc-500 font-normal">
                              {new Date(ord.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-semibold text-white block">
                              {ord.customerName}
                            </span>
                            <span className="text-zinc-400">{ord.phone}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 capitalize text-[10px] font-medium mr-1.5">
                              {ord.orderType}
                            </span>
                            <span className="text-zinc-300">
                              {ord.items.length} items
                            </span>
                            <p className="text-[11px] text-zinc-500 truncate max-w-xs mt-0.5">
                              {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                            </p>
                          </td>
                          <td className="p-3.5 font-mono font-bold text-grill-gold">
                            {formatPKR(ord.totalAmount)}
                          </td>
                          <td className="p-3.5">
                            <span className="capitalize block font-medium">
                              {ord.paymentMethod.replace(/_/g, ' ')}
                            </span>
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[10px] mt-0.5 ${
                                ord.paymentVerificationStatus === 'verified'
                                  ? 'bg-emerald-950 text-emerald-400'
                                  : ord.paymentVerificationStatus === 'cod'
                                  ? 'bg-amber-950 text-amber-400'
                                  : 'bg-red-950 text-red-400'
                              }`}
                            >
                              {ord.paymentVerificationStatus.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <select
                              value={ord.orderStatus}
                              onChange={(e) =>
                                handleUpdateOrderStatus(
                                  ord.id,
                                  e.target.value as OrderStatus
                                )
                              }
                              className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-xs font-semibold focus:outline-none"
                            >
                              <option value="placed">Placed</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="preparing">Preparing</option>
                              <option value="ready_for_pickup">Ready for Pickup</option>
                              <option value="out_for_delivery">Out for Delivery</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-grill-gold transition-colors"
                              title="View Order Details & Print"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: MENU MANAGEMENT
           ======================================================== */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            {/* Actions bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-grill-card border border-grill-border">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search dishes..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-grill-dark border border-zinc-800 text-white text-xs focus:border-grill-gold focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={menuCategoryFilter}
                  onChange={(e) => setMenuCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-grill-dark border border-zinc-800 text-xs text-white focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    setEditingDish(null);
                    setIsDishModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-grill-orange to-grill-red hover:from-grill-orange-light text-white font-bold text-xs shadow-orangeGlow flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Dish</span>
                </button>
              </div>
            </div>

            {/* Dishes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenuItems.map((dish) => (
                <div
                  key={dish.id}
                  className="p-5 rounded-2xl bg-grill-card border border-grill-border flex flex-col justify-between space-y-4 hover:border-grill-gold/40 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
                      <Image
                        src={dish.image || '/images/chicken-karahi.jpg'}
                        alt={dish.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            dish.isAvailable
                              ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-700'
                              : 'bg-red-950/90 text-red-400 border border-red-700'
                          }`}
                        >
                          {dish.isAvailable ? 'Available' : 'Sold Out'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-grill-gold">
                        {dish.categorySlug.replace(/-/g, ' ')}
                      </span>
                      <h4 className="text-base font-bold text-white font-heading truncate">
                        {dish.name}
                      </h4>
                      <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                        {dish.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="font-mono text-base font-bold text-grill-gold">
                        {formatPKR(dish.basePrice)}
                      </span>
                      {dish.variants && dish.variants.length > 0 && (
                        <span className="text-[11px] text-zinc-400">
                          {dish.variants.length} portions
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Admin controls */}
                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleDishAvailability(dish)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
                    >
                      {dish.isAvailable ? 'Mark Sold Out' : 'Mark Available'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingDish(dish);
                          setIsDishModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-grill-gold transition-colors"
                        title="Edit Dish & Price"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteDish(dish.id)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-900/60 text-red-400 transition-colors"
                        title="Delete Dish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: QR CODE HUB
           ======================================================== */}
        {activeTab === 'qr' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-grill-card border border-grill-border flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white font-heading">
                  Automatic QR Code Center
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                  Every single dish has an automatic, permanent product QR code. Print labels for table standees or download printable multi-dish sheets.
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-grill-gold text-grill-black font-bold text-xs shadow-gold flex items-center gap-2 hover:bg-grill-gold-light transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print QR Sticker Sheet</span>
              </button>
            </div>

            {/* QR Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {menuItems.map((dish) => (
                <div
                  key={dish.id}
                  className="p-5 rounded-2xl bg-white text-black shadow-xl flex flex-col items-center text-center space-y-3"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                    GRILLVI LAHORE
                  </span>

                  {dish.qrCodeDataUrl ? (
                    <img
                      src={dish.qrCodeDataUrl}
                      alt={`QR Code for ${dish.name}`}
                      className="w-40 h-40 object-contain"
                    />
                  ) : (
                    <div className="w-40 h-40 bg-zinc-100 flex items-center justify-center text-xs font-mono">
                      Generating...
                    </div>
                  )}

                  <div>
                    <h4 className="font-heading font-black text-sm text-black truncate max-w-[200px]">
                      {dish.name}
                    </h4>
                    <span className="font-mono font-bold text-xs text-grill-orange">
                      {formatPKR(dish.basePrice)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-zinc-200 w-full flex items-center justify-center gap-2">
                    <a
                      href={`/api/qr/${dish.id}?format=png`}
                      download={`grillvi-qr-${dish.slug}.png`}
                      className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-black text-xs font-semibold"
                      title="Download PNG"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    <Link
                      href={`/menu/item/${dish.id}`}
                      target="_blank"
                      className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-black text-xs font-semibold"
                      title="Open Public Dish Page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: PAYMENT SETTINGS
           ======================================================== */}
        {activeTab === 'payments' && paymentSettings && (
          <div className="max-w-4xl space-y-6">
            <div className="p-6 rounded-2xl bg-grill-card border border-grill-border space-y-6">
              <h3 className="text-lg font-bold text-white font-heading">
                Configure Pakistan Payment Methods & Delivery Fees
              </h3>

              {/* Easypaisa */}
              <div className="p-4 rounded-xl bg-grill-dark border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-emerald-400">Easypaisa Mobile Account</h4>
                  <label className="flex items-center gap-2 text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={paymentSettings.easypaisa.enabled}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          easypaisa: {
                            ...paymentSettings.easypaisa,
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="accent-emerald-400"
                    />
                    <span>Enabled</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1">Account Title</label>
                    <input
                      type="text"
                      value={paymentSettings.easypaisa.accountTitle}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          easypaisa: {
                            ...paymentSettings.easypaisa,
                            accountTitle: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Account Number</label>
                    <input
                      type="text"
                      value={paymentSettings.easypaisa.accountNumber}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          easypaisa: {
                            ...paymentSettings.easypaisa,
                            accountNumber: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* JazzCash */}
              <div className="p-4 rounded-xl bg-grill-dark border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-red-400">JazzCash Mobile Account</h4>
                  <label className="flex items-center gap-2 text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={paymentSettings.jazzcash.enabled}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          jazzcash: {
                            ...paymentSettings.jazzcash,
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="accent-red-400"
                    />
                    <span>Enabled</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1">Account Title</label>
                    <input
                      type="text"
                      value={paymentSettings.jazzcash.accountTitle}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          jazzcash: {
                            ...paymentSettings.jazzcash,
                            accountTitle: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Account Number</label>
                    <input
                      type="text"
                      value={paymentSettings.jazzcash.accountNumber}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          jazzcash: {
                            ...paymentSettings.jazzcash,
                            accountNumber: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Transfer */}
              <div className="p-4 rounded-xl bg-grill-dark border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-blue-400">Bank Transfer (Meezan Bank)</h4>
                  <label className="flex items-center gap-2 text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={paymentSettings.bankTransfer.enabled}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          bankTransfer: {
                            ...paymentSettings.bankTransfer,
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="accent-blue-400"
                    />
                    <span>Enabled</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={paymentSettings.bankTransfer.bankName}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          bankTransfer: {
                            ...paymentSettings.bankTransfer,
                            bankName: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Account Title</label>
                    <input
                      type="text"
                      value={paymentSettings.bankTransfer.accountTitle}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          bankTransfer: {
                            ...paymentSettings.bankTransfer,
                            accountTitle: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Account Number</label>
                    <input
                      type="text"
                      value={paymentSettings.bankTransfer.accountNumber}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          bankTransfer: {
                            ...paymentSettings.bankTransfer,
                            accountNumber: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">IBAN</label>
                    <input
                      type="text"
                      value={paymentSettings.bankTransfer.iban}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          bankTransfer: {
                            ...paymentSettings.bankTransfer,
                            iban: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Fees & Thresholds */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-zinc-400 block mb-1">Default Delivery Fee (Rs)</label>
                  <input
                    type="number"
                    value={paymentSettings.defaultDeliveryFee}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        defaultDeliveryFee: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Free Delivery Threshold (Rs)</label>
                  <input
                    type="number"
                    value={paymentSettings.freeDeliveryThreshold}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        freeDeliveryThreshold: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Minimum Order Value (Rs)</label>
                  <input
                    type="number"
                    value={paymentSettings.minOrderValue}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        minOrderValue: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono"
                  />
                </div>
              </div>

              <button
                onClick={async () => {
                  setSavingPaymentSettings(true);
                  try {
                    const res = await fetch('/api/settings/payment', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(paymentSettings),
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      throw new Error(data.error || 'Failed to save payment settings.');
                    }
                    if (data.settings) setPaymentSettings(data.settings);
                    showToast('Payment settings saved.');
                  } catch (error) {
                    showToast(
                      error instanceof Error
                        ? error.message
                        : 'Failed to save payment settings.'
                    );
                  } finally {
                    setSavingPaymentSettings(false);
                  }
                }}
                disabled={savingPaymentSettings}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-grill-orange to-grill-red text-white font-bold text-xs shadow-orangeGlow hover:from-grill-orange-light"
              >
                {savingPaymentSettings ? 'Saving...' : 'Save Payment Settings'}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 6: REVIEWS MODERATION
           ======================================================== */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white font-heading">
              Customer Reviews Moderation ({reviews.length})
            </h3>

            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl bg-grill-card border border-grill-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-white text-sm">{rev.customerName}</strong>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rev.status === 'approved'
                            ? 'bg-emerald-950 text-emerald-400'
                            : rev.status === 'rejected'
                            ? 'bg-red-950 text-red-400'
                            : 'bg-amber-950 text-amber-400'
                        }`}
                      >
                        {rev.status.toUpperCase()}
                      </span>
                      <span className="text-zinc-500 font-mono">
                        {rev.rating} / 5 stars
                      </span>
                    </div>
                    <p className="text-zinc-300 italic">&ldquo;{rev.comment}&rdquo;</p>
                    {rev.dishRecommended && (
                      <span className="text-grill-gold block text-[11px]">
                        Dish: {rev.dishRecommended}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {rev.status !== 'approved' && (
                      <button
                        onClick={() => handleReviewStatus(rev.id, 'approved')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                      >
                        Approve
                      </button>
                    )}
                    {rev.status !== 'rejected' && (
                      <button
                        onClick={() => handleReviewStatus(rev.id, 'rejected')}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs"
                      >
                        Reject
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteReview(rev.id)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-900/60 text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 7: RESTAURANT SETTINGS
           ======================================================== */}
        {activeTab === 'settings' && restaurantSettings && (
          <div className="max-w-4xl space-y-6">
            <div className="p-6 rounded-2xl bg-grill-card border border-grill-border space-y-6">
              <h3 className="text-lg font-bold text-white font-heading">
                Restaurant Info, Timings & Announcements
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-zinc-400 block mb-1">Restaurant Name</label>
                  <input
                    type="text"
                    value={restaurantSettings.name}
                    onChange={(e) =>
                      setRestaurantSettings({
                        ...restaurantSettings,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Tagline</label>
                  <input
                    type="text"
                    value={restaurantSettings.tagline}
                    onChange={(e) =>
                      setRestaurantSettings({
                        ...restaurantSettings,
                        tagline: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={restaurantSettings.phone}
                    onChange={(e) =>
                      setRestaurantSettings({
                        ...restaurantSettings,
                        phone: e.target.value,
                        whatsapp: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Google Maps Plus Code</label>
                  <input
                    type="text"
                    value={restaurantSettings.googleMapsPlusCode}
                    onChange={(e) =>
                      setRestaurantSettings({
                        ...restaurantSettings,
                        googleMapsPlusCode: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 text-xs">Complete Address</label>
                <input
                  type="text"
                  value={restaurantSettings.address}
                  onChange={(e) =>
                    setRestaurantSettings({
                      ...restaurantSettings,
                      address: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 text-xs">Website Announcement Banner</label>
                <input
                  type="text"
                  value={restaurantSettings.announcementBanner?.text || ''}
                  onChange={(e) =>
                    setRestaurantSettings({
                      ...restaurantSettings,
                      announcementBanner: {
                        enabled: true,
                        badge: 'FRESH ON THE COALS',
                        text: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs"
                />
              </div>

              <button
                onClick={async () => {
                  const res = await fetch('/api/settings/restaurant', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(restaurantSettings),
                  });
                  if (res.ok) showToast('Restaurant details updated.');
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-grill-orange to-grill-red text-white font-bold text-xs shadow-orangeGlow hover:from-grill-orange-light"
              >
                Save Restaurant Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL: ORDER DETAILS & PRINTABLE RECEIPT / KOT
         ======================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-grill-card border border-grill-border rounded-3xl p-6 shadow-2xl relative text-white max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              ✕
            </button>

            <div className="border-b border-grill-border pb-4">
              <span className="text-[10px] font-bold text-grill-gold tracking-widest uppercase">
                ORDER DETAILS & KITCHEN TICKET
              </span>
              <h3 className="text-2xl font-black font-heading mt-0.5">
                {selectedOrder.id}
              </h3>
              <p className="text-xs text-zinc-400">
                Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-grill-dark p-4 rounded-xl border border-zinc-800">
              <div>
                <span className="text-zinc-500 block">Customer Name</span>
                <strong className="text-white text-sm">{selectedOrder.customerName}</strong>
              </div>
              <div>
                <span className="text-zinc-500 block">Phone Number</span>
                <strong className="text-white font-mono">{selectedOrder.phone}</strong>
              </div>
              <div>
                <span className="text-zinc-500 block">Order Type</span>
                <strong className="text-white capitalize">{selectedOrder.orderType}</strong>
              </div>
              <div>
                <span className="text-zinc-500 block">Payment Method</span>
                <strong className="text-white capitalize">
                  {selectedOrder.paymentMethod.replace(/_/g, ' ')}
                </strong>
              </div>
            </div>

            {selectedOrder.deliveryAddress && (
              <div className="p-3 rounded-xl bg-grill-dark border border-zinc-800 text-xs">
                <span className="text-zinc-400 block font-semibold mb-0.5">Delivery Address:</span>
                <p className="text-zinc-200">{selectedOrder.deliveryAddress}</p>
                {selectedOrder.addressNotes && (
                  <p className="text-zinc-400 text-[11px] mt-1">Note: {selectedOrder.addressNotes}</p>
                )}
              </div>
            )}

            {/* Payment Verification slip if uploaded */}
            {selectedOrder.paymentReceiptUrl && (
              <div className="p-4 rounded-xl bg-grill-dark border border-zinc-800 text-xs space-y-2">
                <span className="text-grill-gold font-bold block">Payment Receipt Proof Uploaded:</span>
                <a
                  href={selectedOrder.paymentReceiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 underline block"
                >
                  View Full Receipt Image ({selectedOrder.paymentReceiptUrl})
                </a>
              </div>
            )}

            {/* Items Breakdown */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                Ordered Dishes:
              </h4>
              <div className="space-y-2 divide-y divide-zinc-800">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="pt-2 flex justify-between items-start">
                    <div>
                      <strong className="text-white text-sm">
                        {item.quantity}x {item.name}
                      </strong>
                      {item.variantName && (
                        <span className="text-grill-gold block text-xs">
                          Portion: {item.variantName}
                        </span>
                      )}
                      {item.addOns && item.addOns.length > 0 && (
                        <span className="text-zinc-400 block text-[11px]">
                          + {item.addOns.map((a) => a.name).join(', ')}
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-bold text-grill-gold">
                      {formatPKR(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-grill-border flex justify-between items-center text-sm">
              <span className="font-bold text-white">Final Total</span>
              <span className="font-mono text-xl font-black text-grill-gold">
                {formatPKR(selectedOrder.totalAmount)}
              </span>
            </div>

            {/* Actions: Verify Payment, Change Status, Print KOT / Receipt */}
            <div className="pt-4 border-t border-grill-border flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {selectedOrder.paymentVerificationStatus !== 'verified' && (
                  <button
                    onClick={() => handleVerifyPayment(selectedOrder.id, 'verified')}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    Verify Payment
                  </button>
                )}
                <button
                  onClick={() => window.print()}
                  className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-grill-gold" />
                  <span>Print KOT / Receipt</span>
                </button>
              </div>

              <select
                value={selectedOrder.orderStatus}
                onChange={(e) =>
                  handleUpdateOrderStatus(selectedOrder.id, e.target.value as OrderStatus)
                }
                className="px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs font-semibold"
              >
                <option value="placed">Placed</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready_for_pickup">Ready for Pickup</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD / EDIT DISH
         ======================================================== */}
      {isDishModalOpen && (
        <DishFormModal
          categories={categories}
          initialDish={editingDish}
          onClose={() => setIsDishModalOpen(false)}
          onSaved={(dish) => {
            if (editingDish) {
              setMenuItems((prev) => prev.map((i) => (i.id === dish.id ? dish : i)));
              showToast(`Updated "${dish.name}"`);
            } else {
              setMenuItems((prev) => [dish, ...prev]);
              showToast(`Added "${dish.name}" to menu`);
            }
            setIsDishModalOpen(false);
          }}
        />
      )}

      {/* ========================================================
          MODAL: CHANGE PASSWORD
         ======================================================== */}
      {isPasswordModalOpen && (
        <ChangePasswordModal
          currentUsername={currentUser?.username || ''}
          onClose={() => setIsPasswordModalOpen(false)}
          onSuccess={(username) => {
            setIsPasswordModalOpen(false);
            setCurrentUser((user: any) =>
              user ? { ...user, username } : user
            );
            showToast('Admin login details updated successfully.');
          }}
        />
      )}
    </div>
  );
}

// Dish Form Modal Component
function DishFormModal({
  categories,
  initialDish,
  onClose,
  onSaved,
}: {
  categories: Category[];
  initialDish: MenuItem | null;
  onClose: () => void;
  onSaved: (item: MenuItem) => void;
}) {
  const [name, setName] = useState(initialDish?.name || '');
  const [categoryId, setCategoryId] = useState(
    initialDish?.categoryId || categories[0]?.id || 'cat-starters'
  );
  const [description, setDescription] = useState(initialDish?.description || '');
  const [basePrice, setBasePrice] = useState(initialDish?.basePrice || 0);
  const [image, setImage] = useState(initialDish?.image || '');
  const [isAvailable, setIsAvailable] = useState(
    initialDish ? initialDish.isAvailable : true
  );
  const [isFeatured, setIsFeatured] = useState(initialDish?.isFeatured || false);
  const [isPopular, setIsPopular] = useState(initialDish?.isPopular || false);
  const [preparationTime, setPreparationTime] = useState(
    initialDish?.preparationTime || '15-20 mins'
  );
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) setImage(data.url);
    } catch (e) {
      console.error(e);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const selectedCat = categories.find((c) => c.id === categoryId) || categories[0];

    const payload = {
      name: name.trim(),
      categoryId: selectedCat.id,
      categorySlug: selectedCat.slug,
      description: description.trim(),
      basePrice: Number(basePrice),
      image: image.trim(),
      isAvailable,
      isFeatured,
      isPopular,
      preparationTime,
    };

    try {
      const url = initialDish ? `/api/menu/items/${initialDish.id}` : '/api/menu/items';
      const method = initialDish ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.item) {
        onSaved(data.item);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-grill-card border border-grill-border rounded-3xl p-6 shadow-2xl relative text-white max-h-[90vh] overflow-y-auto space-y-4">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
          ✕
        </button>

        <h3 className="text-xl font-bold font-heading">
          {initialDish ? 'Edit Dish & Price' : 'Add New Menu Item'}
        </h3>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="text-zinc-300 font-semibold block mb-1">Dish Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-grill-dark border border-zinc-800 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-grill-dark border border-zinc-800 text-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Base Price (PKR) *</label>
              <input
                type="number"
                required
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-grill-dark border border-zinc-800 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-zinc-300 font-semibold block mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-grill-dark border border-zinc-800 text-white"
            />
          </div>

          <div>
            <label className="text-zinc-300 font-semibold block mb-1">Dish Image URL or Upload</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://... or /images/..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-grill-dark border border-zinc-800 text-white text-xs"
              />
              <label className="cursor-pointer px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingImage ? '...' : 'Upload'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="text-zinc-300 font-semibold block mb-1">Estimated Preparation Time</label>
            <input
              type="text"
              placeholder="e.g. 15-20 mins"
              value={preparationTime}
              onChange={(e) => setPreparationTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-grill-dark border border-zinc-800 text-white text-xs"
            />
          </div>

          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="accent-emerald-400"
              />
              <span>Available</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="accent-grill-gold"
              />
              <span>Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="accent-grill-orange"
              />
              <span>Popular</span>
            </label>
          </div>

          <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-xl bg-grill-orange hover:bg-grill-orange-light text-white font-bold"
            >
              {saving ? 'Saving...' : 'Save Dish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Admin Credentials Modal Component
function ChangePasswordModal({
  currentUsername,
  onClose,
  onSuccess,
}: {
  currentUsername: string;
  onClose: () => void;
  onSuccess: (username: string) => void;
}) {
  const [newUsername, setNewUsername] = useState(currentUsername);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, newUsername }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');
      onSuccess(data.user.username);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error updating password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm bg-grill-card border border-grill-border rounded-3xl p-6 shadow-2xl relative text-white space-y-4">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
          ✕
        </button>

        <h3 className="text-lg font-bold font-heading">Change Admin Login Details</h3>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/80 border border-red-700 text-red-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-zinc-300 block mb-1">Admin Username *</label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={50}
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-grill-dark border border-zinc-800 text-white"
            />
          </div>
          <div>
            <label className="text-zinc-300 block mb-1">Current Password *</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-grill-dark border border-zinc-800 text-white"
            />
          </div>
          <div>
            <label className="text-zinc-300 block mb-1">New Password (leave blank to keep current)</label>
            <input
              type="password"
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-grill-dark border border-zinc-800 text-white"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-grill-gold text-grill-black font-bold"
            >
              {loading ? 'Updating...' : 'Save Login Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
