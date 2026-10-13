'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Phone,
  MapPin,
  Clock,
  Compass,
  MessageCircle,
  ShieldCheck,
  Star,
  ExternalLink,
  CreditCard,
  Banknote,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-grill-black text-zinc-400 border-t border-grill-border pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand & Historical Rating */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src="/images/grillvi-logo.png"
                  alt="GRILLVI Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <span className="text-xl font-black text-white font-heading tracking-wide">
                  GRILLVI
                </span>
                <p className="text-xs font-semibold text-grill-gold tracking-widest uppercase">
                  BBQ • RICE • KARAHI
                </p>
              </div>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed">
              Experience the authentic taste of live charcoal BBQ, fragrant spiced rice Thaals,
              and sizzling wok karahis on historic Grand Trunk Road, Lahore.
            </p>

            {/* Google Rating Historical Badge */}
            <div className="p-3.5 rounded-xl bg-grill-card border border-grill-border/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-white font-bold text-sm">
                  <span className="text-grill-gold text-base">4.8</span>
                  <div className="flex text-grill-gold">
                    <Star className="w-3.5 h-3.5 fill-grill-gold" />
                    <Star className="w-3.5 h-3.5 fill-grill-gold" />
                    <Star className="w-3.5 h-3.5 fill-grill-gold" />
                    <Star className="w-3.5 h-3.5 fill-grill-gold" />
                    <Star className="w-3.5 h-3.5 fill-grill-gold" />
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Historical rating from 88 Google reviews
                </p>
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Grillvi+Main+Grand+Trunk+Road+Baghbanpura+Lahore+Pakistan"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-grill-gold hover:text-grill-gold-light flex items-center gap-1 font-semibold"
              >
                Maps <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider font-heading border-b border-grill-border/60 pb-2">
              Explore Menu
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/menu?category=thaal-collection" className="hover:text-grill-gold transition-colors">
                  Signature Thaal Collection
                </Link>
              </li>
              <li>
                <Link href="/menu?category=bbq-platter" className="hover:text-grill-gold transition-colors">
                  BBQ Sharing Platters
                </Link>
              </li>
              <li>
                <Link href="/menu?category=bbq-special" className="hover:text-grill-gold transition-colors">
                  Live BBQ Botis & Kebabs
                </Link>
              </li>
              <li>
                <Link href="/menu?category=pakistani-corner" className="hover:text-grill-gold transition-colors">
                  Lahori Karahi & Handi
                </Link>
              </li>
              <li>
                <Link href="/menu?category=starters" className="hover:text-grill-gold transition-colors">
                  Starters & Paratha Rolls
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-grill-gold transition-colors">
                  Customer Testimonials
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Opening Hours & Service Areas */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider font-heading border-b border-grill-border/60 pb-2">
              Timing & Service
            </h4>
            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-grill-orange flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-200">Dine-In Hours:</span>
                  <p className="text-zinc-400">Monday – Sunday: 5:00 PM – 2:00 AM</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-grill-gold flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-200">Delivery Hours:</span>
                  <p className="text-zinc-400">Daily: 5:00 PM – 1:30 AM</p>
                </div>
              </div>
              <div className="pt-2 text-xs">
                <span className="font-semibold text-zinc-300">Delivery Areas:</span>
                <p className="text-zinc-400 mt-1">
                  Baghbanpura, Shalimar Town, Singhpura, Daroghwala, Salamatpura, GT Road & Mughalpura.
                </p>
              </div>
            </div>
          </div>

          {/* Col 4: Contact & Location */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider font-heading border-b border-grill-border/60 pb-2">
              Visit & Contact
            </h4>
            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-grill-red flex-shrink-0 mt-0.5" />
                <span className="text-zinc-300 leading-snug">
                  Main Grand Trunk Road, near Sunny Pan Shop, Baghbanpura, Lahore, 54920, Pakistan
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-grill-gold flex-shrink-0" />
                <span className="text-zinc-300">Plus Code: H9JF+8R Lahore</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a href="tel:+923141915087" className="text-zinc-300 hover:text-white font-semibold">
                  +92 314 1915087
                </a>
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href="https://wa.me/923141915087"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Order on WhatsApp
                </a>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Grillvi+Main+Grand+Trunk+Road+Baghbanpura+Lahore+Pakistan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-grill-card hover:bg-zinc-800 text-zinc-200 border border-grill-border text-xs font-semibold transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-grill-gold" />
                  Get Google Maps Directions
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods Banner */}
        <div className="pt-8 border-t border-grill-border/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
            <span className="font-semibold text-zinc-300 mr-1">Accepted Payments:</span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-950/70 text-emerald-400 border border-emerald-800/50 font-medium flex items-center gap-1">
              <CreditCard className="w-3 h-3" /> Easypaisa
            </span>
            <span className="px-2.5 py-1 rounded-md bg-red-950/70 text-red-400 border border-red-800/50 font-medium flex items-center gap-1">
              <CreditCard className="w-3 h-3" /> JazzCash
            </span>
            <span className="px-2.5 py-1 rounded-md bg-blue-950/70 text-blue-400 border border-blue-800/50 font-medium flex items-center gap-1">
              <Banknote className="w-3 h-3" /> Meezan Bank
            </span>
            <span className="px-2.5 py-1 rounded-md bg-amber-950/70 text-amber-400 border border-amber-800/50 font-medium flex items-center gap-1">
              <Banknote className="w-3 h-3" /> Cash on Delivery (COD)
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <Link href="/admin/login" className="hover:text-grill-gold transition-colors flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Staff Admin
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-zinc-300">Support</Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-grill-border/40 text-center text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} GRILLVI (BBQ. RICE. KARAHI). All rights reserved. Baghbanpura, Lahore, Pakistan.</p>
        </div>
      </div>
    </footer>
  );
}
