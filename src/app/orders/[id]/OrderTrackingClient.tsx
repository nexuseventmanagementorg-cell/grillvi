'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { Order, PaymentSettings, OrderStatus } from '@/types';
import { formatPKR } from '@/lib/format';
import {
  CheckCircle2,
  Clock,
  Flame,
  Bike,
  CheckCheck,
  Printer,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface OrderTrackingClientProps {
  initialOrder: Order;
  paymentSettings?: PaymentSettings;
}

export default function OrderTrackingClient({
  initialOrder,
}: OrderTrackingClientProps) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [refreshing, setRefreshing] = useState(false);

  // Trigger celebration confetti
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#E5A93C', '#E65100', '#F5C76D', '#D84315'],
      });
    } catch {
      // ignore
    }
  }, []);

  const refreshOrder = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`);
      const data = await res.json();
      if (data.order) {
        setOrder(data.order);
      }
    } catch (e) {
      console.warn('Refresh error:', e);
    } finally {
      setRefreshing(false);
    }
  };

  const statusSteps: Array<{
    status: OrderStatus;
    label: string;
    description: string;
    icon: React.ReactNode;
  }> = [
    {
      status: 'placed',
      label: 'Order Placed',
      description: 'Received in system',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      status: 'confirmed',
      label: 'Confirmed',
      description: 'Accepted by restaurant',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    {
      status: 'preparing',
      label: 'Preparing',
      description: 'Live grill & wok cooking',
      icon: <Flame className="w-4 h-4" />,
    },
    {
      status: order.orderType === 'takeaway' ? 'ready_for_pickup' : 'out_for_delivery',
      label: order.orderType === 'takeaway' ? 'Ready for Pickup' : 'Out for Delivery',
      description: order.orderType === 'takeaway' ? 'Waiting at counter' : 'Rider on the way',
      icon: <Bike className="w-4 h-4" />,
    },
    {
      status: 'completed',
      label: 'Completed',
      description: 'Enjoy your meal!',
      icon: <CheckCheck className="w-4 h-4" />,
    },
  ];

  const getStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'placed':
        return 0;
      case 'confirmed':
        return 1;
      case 'preparing':
        return 2;
      case 'ready_for_pickup':
      case 'out_for_delivery':
        return 3;
      case 'completed':
        return 4;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const currentStep = getStepIndex(order.orderStatus);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-grill-card border border-grill-border shadow-card text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-grill-gold">
            ORDER CONFIRMED & SAVED
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-heading mt-1">
            Thank You, {order.customerName}!
          </h1>
          <p className="font-mono text-base font-bold text-grill-orange mt-1">
            Order ID: {order.id}
          </p>
        </div>

      </div>

      {/* Live Order Timeline */}
      <div className="p-6 sm:p-8 rounded-3xl bg-grill-card border border-grill-border space-y-6 shadow-card">
        <div className="flex items-center justify-between pb-4 border-b border-grill-border">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-grill-gold" />
            <h2 className="text-lg font-bold text-white font-heading">
              Live Order Status
            </h2>
          </div>

          <button
            onClick={refreshOrder}
            disabled={refreshing}
            className="text-xs text-zinc-400 hover:text-grill-gold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Checking...' : 'Refresh Status'}</span>
          </button>
        </div>

        {order.orderStatus === 'cancelled' ? (
          <div className="p-4 rounded-2xl bg-red-950/80 border border-red-700 text-red-200 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <span>This order has been cancelled. Please contact the restaurant for assistance.</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {statusSteps.map((step, idx) => {
              const isPassed = currentStep >= idx;
              const isCurrent = currentStep === idx;

              return (
                <div
                  key={step.status}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center text-center space-y-2 transition-all ${
                    isCurrent
                      ? 'border-grill-gold bg-grill-gold/20 shadow-gold'
                      : isPassed
                      ? 'border-emerald-600/50 bg-emerald-950/20 text-zinc-300'
                      : 'border-zinc-800 bg-grill-dark opacity-50'
                  }`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      isCurrent
                        ? 'bg-grill-gold text-grill-black'
                        : isPassed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{step.label}</h3>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Payment Verification Status Notification */}
        {order.paymentMethod !== 'cash_on_delivery' && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-center gap-3 border ${
              order.paymentVerificationStatus === 'verified'
                ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-200'
                : order.paymentVerificationStatus === 'rejected'
                ? 'bg-red-950/60 border-red-700/60 text-red-200'
                : 'bg-amber-950/60 border-amber-700/60 text-amber-200'
            }`}
          >
            {order.paymentVerificationStatus === 'verified' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-400" />
            )}
            <div>
              <span className="font-bold block">
                Payment Status:{' '}
                {order.paymentVerificationStatus === 'verified'
                  ? 'Payment Verified by Staff'
                  : order.paymentVerificationStatus === 'rejected'
                  ? 'Payment Verification Rejected'
                  : 'Payment Pending Verification'}
              </span>
              <p className="text-[11px] opacity-90 mt-0.5">
                {order.paymentVerificationStatus === 'verified'
                  ? 'Your payment transfer has been verified and confirmed.'
                  : 'Our counter staff is verifying the transaction. Keep your receipt handy!'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Printable Receipt Card */}
      <div id="printable-receipt" className="p-6 sm:p-8 rounded-3xl bg-grill-card border border-grill-border space-y-6 shadow-card">
        <div className="flex items-center justify-between pb-4 border-b border-grill-border">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-grill-gold uppercase">
              OFFICIAL RECEIPT
            </span>
            <h3 className="text-xl font-black text-white font-heading">
              Restaurant Name
            </h3>
            <p className="text-xs text-zinc-400">
              Online Order Receipt
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4 text-grill-gold" />
            <span>Print Receipt</span>
          </button>
        </div>

        {/* Customer & Order Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-zinc-500 block">Customer</span>
            <strong className="text-white font-medium">{order.customerName}</strong>
          </div>
          <div>
            <span className="text-zinc-500 block">Phone</span>
            <strong className="text-white font-mono">{order.phone}</strong>
          </div>
          <div>
            <span className="text-zinc-500 block">Order Type</span>
            <strong className="text-white capitalize">
              {order.orderType === 'delivery' ? 'Home Delivery' : 'Takeaway'}
            </strong>
          </div>
          <div>
            <span className="text-zinc-500 block">Payment Method</span>
            <strong className="text-white capitalize">
              {order.paymentMethod.replace(/_/g, ' ')}
            </strong>
          </div>
        </div>

        {order.orderType === 'delivery' && order.deliveryAddress && (
          <div className="p-3 rounded-xl bg-grill-dark border border-zinc-800 text-xs text-zinc-300">
            <span className="text-zinc-400 block font-semibold mb-0.5">Delivery Address:</span>
            <span>{order.deliveryAddress}</span>
            {order.addressNotes && (
              <span className="block text-zinc-400 text-[11px] mt-1">
                Note: {order.addressNotes}
              </span>
            )}
          </div>
        )}

        {/* Ordered Items Table */}
        <div className="space-y-3 pt-2">
          <div className="border-b border-zinc-800 pb-2 flex justify-between text-xs text-zinc-400 font-semibold uppercase">
            <span>Item & Portions</span>
            <span>Subtotal</span>
          </div>

          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-start text-xs sm:text-sm py-1.5 border-b border-zinc-800/40"
            >
              <div>
                <span className="font-bold text-white">
                  {item.quantity}x {item.name}
                </span>
                {item.variantName && (
                  <span className="text-grill-gold block text-xs">
                    Portion: {item.variantName}
                  </span>
                )}
                {item.addOns && item.addOns.length > 0 && (
                  <span className="text-zinc-400 block text-xs">
                    + {item.addOns.map((a) => a.name).join(', ')}
                  </span>
                )}
              </div>
              <span className="font-mono font-bold text-white">
                {formatPKR(item.subtotal)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="pt-4 border-t border-grill-border space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-zinc-400">
            <span>Subtotal</span>
            <span className="font-mono text-white">{formatPKR(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Delivery Fee</span>
            <span className="font-mono text-white">
              {order.orderType === 'takeaway'
                ? 'Rs 0 (Takeaway)'
                : formatPKR(order.deliveryFee)}
            </span>
          </div>
          <div className="flex justify-between text-base sm:text-lg font-bold text-white pt-2 border-t border-zinc-800">
            <span>Total Payable</span>
            <span className="font-mono font-black text-grill-gold">
              {formatPKR(order.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Return to menu action */}
      <div className="text-center pt-4">
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 text-sm font-bold text-grill-gold hover:text-grill-gold-light"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Menu / Order More Items</span>
        </Link>
      </div>
    </div>
  );
}
