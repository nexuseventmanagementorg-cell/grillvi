import { NextRequest, NextResponse } from 'next/server';
import { getItemById } from '@/lib/db';
import { getItemProductUrl, generateQrDataUrl, generateQrSvgString } from '@/lib/qr';
import QRCode from 'qrcode';

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

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format');
    const productUrl = getItemProductUrl(item.id);

    if (format === 'svg') {
      const svg = await generateQrSvgString(productUrl, { width: 400 });
      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Content-Disposition': `attachment; filename="grillvi-qr-${item.slug}.svg"`,
        },
      });
    }

    if (format === 'png') {
      const buffer = await QRCode.toBuffer(productUrl, {
        width: 600,
        margin: 2,
        color: { dark: '#0C0C0E', light: '#FFFFFF' },
      });
      return new NextResponse(buffer as unknown as BodyInit, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="grillvi-qr-${item.slug}.png"`,
        },
      });
    }

    const qrDataUrl = await generateQrDataUrl(productUrl, { width: 400 });

    return NextResponse.json({
      success: true,
      itemId: item.id,
      name: item.name,
      productUrl,
      qrDataUrl,
    });
  } catch (err) {
    console.error('QR code generation error:', err);
    return NextResponse.json({ error: 'Failed to generate QR code.' }, { status: 500 });
  }
}
