import { NextRequest, NextResponse } from 'next/server';
import { getOrders, createOrder } from '@/lib/db';
import { calculateOrderPricing } from '@/lib/pricing';
import { buildWhatsAppLink, buildWhatsAppOrderMessage } from '@/lib/whatsapp';
import { getSessionAdmin } from '@/lib/auth';
import {
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentVerificationStatus,
  OrderType,
} from '@/types';

function generateOrderId(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `GV-${year}${month}-${randomNum}`;
}

export async function GET(req: NextRequest) {
  const session = await getSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const paymentMethod = searchParams.get('paymentMethod') || undefined;
    const search = searchParams.get('search') || undefined;

    const orders = getOrders({ status, paymentMethod, search });
    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    return NextResponse.json({ error: 'Failed to fetch orders.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      phone,
      whatsappNumber,
      orderType,
      deliveryAddress,
      addressNotes,
      customerInstructions,
      items,
      paymentMethod,
      paymentReceiptUrl,
      paymentReference,
    } = body;

    // Validation
    if (!customerName || customerName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Please enter a valid customer name.' },
        { status: 400 }
      );
    }

    if (!phone || phone.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please provide a valid phone number (e.g. 0314 1915087).' },
        { status: 400 }
      );
    }

    const type: OrderType = orderType === 'takeaway' ? 'takeaway' : 'delivery';

    if (type === 'delivery' && (!deliveryAddress || deliveryAddress.trim().length < 5)) {
      return NextResponse.json(
        { error: 'Please enter a complete delivery address for home delivery.' },
        { status: 400 }
      );
    }

    const validPaymentMethods: PaymentMethod[] = [
      'easypaisa',
      'jazzcash',
      'bank_transfer',
      'cash_on_delivery',
    ];

    if (!validPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method selected.' },
        { status: 400 }
      );
    }

    // STRICT SERVER-SIDE PRICING VALIDATION
    const pricing = calculateOrderPricing(items, type);

    if (pricing.errors.length > 0) {
      return NextResponse.json(
        { error: pricing.errors.join(' ') },
        { status: 400 }
      );
    }

    const orderId = generateOrderId();
    const now = new Date().toISOString();

    const paymentVerificationStatus: PaymentVerificationStatus =
      paymentMethod === 'cash_on_delivery' ? 'cod' : 'pending_verification';

    const initialOrderStatus: OrderStatus = 'placed';

    const newOrder: Order = {
      id: orderId,
      customerName: customerName.trim(),
      phone: phone.trim(),
      whatsappNumber: whatsappNumber ? whatsappNumber.trim() : undefined,
      orderType: type,
      deliveryAddress: type === 'delivery' ? deliveryAddress.trim() : undefined,
      addressNotes: addressNotes ? addressNotes.trim() : undefined,
      customerInstructions: customerInstructions ? customerInstructions.trim() : undefined,
      items: pricing.items,
      subtotal: pricing.subtotal,
      deliveryFee: pricing.deliveryFee,
      discount: pricing.discount,
      totalAmount: pricing.totalAmount,
      paymentMethod,
      paymentVerificationStatus,
      paymentReceiptUrl: paymentReceiptUrl || undefined,
      paymentReference: paymentReference || undefined,
      orderStatus: initialOrderStatus,
      statusHistory: [
        {
          status: initialOrderStatus,
          timestamp: now,
          note: `Order placed via website (${paymentMethod.replace(/_/g, ' ')})`,
          updatedBy: 'customer',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    const savedOrder = createOrder(newOrder);

    // Build WhatsApp URL
    const whatsappUrl = buildWhatsAppLink(savedOrder);
    const whatsappMessage = buildWhatsAppOrderMessage(savedOrder);

    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully!',
        order: savedOrder,
        whatsappUrl,
        whatsappMessage,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Error creating order:', err);
    return NextResponse.json(
      { error: 'Failed to process order. Please try again.' },
      { status: 500 }
    );
  }
}
