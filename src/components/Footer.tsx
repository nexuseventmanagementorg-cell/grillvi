'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Flame, MessageCircle, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-grill-border bg-grill-black pt-12 pb-8 text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-grill-gold/30 bg-grill-card text-grill-gold">
                <Flame className="h-6 w-6" />
              </span>
              <span>
                <span className="block text-lg font-black tracking-wide text-white font-heading">
                  Restaurant Name
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-grill-gold">
                  Your Restaurant Tagline
                </span>
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-zinc-400">
              A restaurant website template. Add your brand story, business hours, and service
              details in the admin settings.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="border-b border-grill-border/60 pb-2 text-sm font-bold uppercase tracking-wider text-white font-heading">
              Explore
            </h2>
            <ul className="space-y-2 text-sm">
              <li><Link href="/menu" className="transition-colors hover:text-grill-gold">Full Menu</Link></li>
              <li><Link href="/menu?category=thaal-collection" className="transition-colors hover:text-grill-gold">Sharing Meals</Link></li>
              <li><Link href="/reviews" className="transition-colors hover:text-grill-gold">Customer Reviews</Link></li>
              <li><Link href="/about" className="transition-colors hover:text-grill-gold">About</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-grill-gold">Contact</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="border-b border-grill-border/60 pb-2 text-sm font-bold uppercase tracking-wider text-white font-heading">
              Restaurant Information
            </h2>
            <p className="text-sm leading-relaxed">
              Business contact details and address are not configured. Add your own information
              before publishing this template.
            </p>
            <Link href="/admin/login" className="inline-flex items-center gap-2 text-sm font-semibold text-grill-gold transition-colors hover:text-white">
              <ShieldCheck className="h-4 w-4" />
              Admin Settings
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-grill-border/40 pt-6 text-xs text-zinc-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Restaurant Name. All rights reserved.</p>
          <span className="inline-flex items-center gap-2">
            <span>Website developed by</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-zinc-300">
              <Image
                src="/images/durrani-web-developers-logo.png"
                alt="Durrani Web Developers"
                width={22}
                height={22}
                className="h-5 w-5 rounded-full object-contain"
              />
              Durrani Web Developers
            </span>
            <a
              href="https://wa.me/923054359098"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 transition-colors hover:text-emerald-400"
              aria-label="Contact Durrani Web Developers on WhatsApp"
            >
              <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
              <span>0305 4359098</span>
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
