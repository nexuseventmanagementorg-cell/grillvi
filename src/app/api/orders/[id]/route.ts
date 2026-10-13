import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus, verifyPayment } from '@/lib/db';
import { getSessionAdmin } from '@/lib/auth';
import { OrderStatus, PaymentVerificationStatus } from '@/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = getOrderById(id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error('Error fetching order:', err);
    return NextResponse.json({ error: 'Failed to fetch order.' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { status, paymentVerificationStatus, note } = body;

    let order = getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (paymentVerificationStatus) {
      order = verifyPayment(id, paymentVerificationStatus as PaymentVerificationStatus, note);
    }

    if (status) {
      order = updateOrderStatus(id, status as OrderStatus, note, session.username);
    }

    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error('Error updating order:', err);
    return NextResponse.json({ error: 'Failed to update order.' }, { status: 500 });
  }
}
