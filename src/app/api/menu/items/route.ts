import { NextRequest, NextResponse } from 'next/server';
import { getItems, createItem } from '@/lib/db';
import { getSessionAdmin } from '@/lib/auth';
import { generateQrDataUrl, getItemProductUrl } from '@/lib/qr';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const featuredOnly = searchParams.get('featured') === 'true';
    const availableOnly = searchParams.get('available') === 'true';

    const items = getItems({
      category,
      search,
      featuredOnly,
      availableOnly,
    });

    return NextResponse.json({ success: true, count: items.length, items });
  } catch (err) {
    console.error('Error fetching menu items:', err);
    return NextResponse.json({ error: 'Failed to fetch items.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name,
      slug,
      categoryId,
      categorySlug,
      description,
      basePrice,
      hasVariants,
      variants,
      addOns,
      image,
      isAvailable,
      isFeatured,
      isPopular,
      preparationTime,
    } = body;

    if (!name || !categoryId || !categorySlug || basePrice === undefined) {
      return NextResponse.json(
        { error: 'Name, category, and base price are required.' },
        { status: 400 }
      );
    }

    const generatedSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    // Pre-generate QR Code
    const tempId = `gv-${Date.now().toString(36)}`;
    const productUrl = getItemProductUrl(tempId);
    let qrDataUrl = '';
    try {
      qrDataUrl = await generateQrDataUrl(productUrl);
    } catch (e) {
      console.warn('QR generation fallback:', e);
    }

    const newItem = createItem({
      name,
      slug: generatedSlug,
      categoryId,
      categorySlug,
      description: description || '',
      basePrice: Number(basePrice),
      hasVariants: Boolean(hasVariants),
      variants: variants || [],
      addOns: addOns || [],
      image: image || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      isFeatured: Boolean(isFeatured),
      isPopular: Boolean(isPopular),
      preparationTime: preparationTime || '15-20 mins',
      qrCodeDataUrl: qrDataUrl,
    });

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (err) {
    console.error('Error creating menu item:', err);
    return NextResponse.json({ error: 'Failed to create menu item.' }, { status: 500 });
  }
}
