import { NextRequest, NextResponse } from 'next/server';
import { getItemById, updateItem, deleteItem } from '@/lib/db';
import { getSessionAdmin } from '@/lib/auth';
import { generateQrDataUrl, getItemProductUrl } from '@/lib/qr';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = getItemById(id);

    if (!item) {
      return NextResponse.json({ error: 'Item not found.' }, { status: 404 });
    }

    // Ensure item has a fresh QR code
    if (!item.qrCodeDataUrl) {
      try {
        const productUrl = getItemProductUrl(item.id);
        item.qrCodeDataUrl = await generateQrDataUrl(productUrl);
        updateItem(item.id, { qrCodeDataUrl: item.qrCodeDataUrl });
      } catch (err) {
        console.warn('QR generation error:', err);
      }
    }

    return NextResponse.json({ success: true, item });
  } catch (err) {
    console.error('Error fetching item:', err);
    return NextResponse.json({ error: 'Failed to fetch item.' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const updates = await req.json();

    const updated = updateItem(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Item not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: updated });
  } catch (err) {
    console.error('Error updating item:', err);
    return NextResponse.json({ error: 'Failed to update item.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const deleted = deleteItem(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Item not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Item deleted successfully.' });
  } catch (err) {
    console.error('Error deleting item:', err);
    return NextResponse.json({ error: 'Failed to delete item.' }, { status: 500 });
  }
}
