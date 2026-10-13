import React from 'react';
import Link from 'next/link';
import { getItemById, getItems } from '@/lib/db';
import { generateQrDataUrl, getItemProductUrl } from '@/lib/qr';
import ItemDetailClient from './ItemDetailClient';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = getItemById(id);

  if (!item) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-3xl font-black text-white font-heading">
          Dish Not Available
        </h1>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">
          The dish you are looking for may have been archived or updated. Browse our full menu to discover other delicious BBQ & karahi specialties!
        </p>
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-grill-orange text-white font-bold text-sm shadow-orangeGlow"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Full Menu
        </Link>
      </div>
    );
  }

  // Generate QR code data URL on server
  const productUrl = getItemProductUrl(item.id);
  const qrDataUrl = await generateQrDataUrl(productUrl, { width: 450 });

  // Related dishes from same category
  const relatedDishes = getItems({ category: item.categorySlug })
    .filter((d) => d.id !== item.id)
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <Link href="/" className="hover:text-white">
          Home
        </Link>
        <span>/</span>
        <Link href="/menu" className="hover:text-white">
          Menu
        </Link>
        <span>/</span>
        <Link
          href={`/menu?category=${item.categorySlug}`}
          className="hover:text-white capitalize"
        >
          {item.categorySlug.replace(/-/g, ' ')}
        </Link>
        <span>/</span>
        <span className="text-grill-gold font-medium truncate">{item.name}</span>
      </div>

      {/* Interactive Item Client Component with Portions, Add-ons, Cart and QR Tools */}
      <ItemDetailClient
        item={item}
        qrDataUrl={qrDataUrl}
        productUrl={productUrl}
        relatedDishes={relatedDishes}
      />
    </div>
  );
}
