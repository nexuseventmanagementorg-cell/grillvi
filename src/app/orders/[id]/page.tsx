import React from 'react';
import { notFound } from 'next/navigation';
import { getOrderById, getPaymentSettings } from '@/lib/db';
import OrderTrackingClient from './OrderTrackingClient';

export const dynamic = 'force-dynamic';

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  const paymentSettings = getPaymentSettings();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <OrderTrackingClient
        initialOrder={order}
        paymentSettings={paymentSettings}
      />
    </div>
  );
}
