'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import {
  ShoppingBag,
  Menu as MenuIcon,
  X,
  Phone,
  Flame,
  ShieldCheck,
  MapPin,
  UtensilsCrossed,
} from 'lucide-react';
import { formatPKR } from '@/lib/format';

export default function Navbar() {
  const pathname = usePathname();
  const { itemCount, subtotal, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Full Menu', href: '/menu' },
    { name: 'Thaal Collection', href: '/menu?category=thaal-collection' },
    { name: 'BBQ Platters', href: '/menu?category=bbq-platter' },
    { name: 'Reviews', href: '/reviews' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 bg-grill-black/95 backdrop-blur-md border-b border-grill-border shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/images/grillvi-logo.png"
                alt="GRILLVI Restaurant Logo"
                fill
                priority
                className="object-contain drop-shadow-[0_2px_10px_rgba(230,81,0,0.4)]"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-wider text-white font-heading group-hover:text-grill-gold transition-colors">
                GRILLVI
              </span>
              <span className="text-[10px] sm:text-xs font-semibold tracking-widest text-grill-gold uppercase">
                BBQ • RICE • KARAHI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'text-grill-gold bg-grill-card border border-grill-gold/30 shadow-gold'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Call button */}
            <a
              href="tel:+923141915087"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 bg-grill-card border border-grill-border hover:border-grill-gold/40 hover:text-grill-gold transition-all"
            >
              <Phone className="w-3.5 h-3.5 text-grill-orange" />
              <span>0314 1915087</span>
            </a>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-grill-orange to-grill-red hover:from-grill-orange-light hover:to-grill-red text-white font-semibold text-sm shadow-orangeGlow transition-all duration-200 active:scale-95 group"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="flex items-center justify-center bg-white text-grill-black text-xs font-black rounded-full h-5 min-w-[20px] px-1 shadow">
                  {itemCount}
                </span>
              )}
              {subtotal > 0 && (
                <span className="hidden md:inline font-mono text-xs border-l border-white/30 pl-2">
                  {formatPKR(subtotal)}
                </span>
              )}
            </button>

            {/* Admin Portal Icon Link */}
            <Link
              href="/admin/login"
              title="Admin Portal"
              className="p-2 rounded-lg text-zinc-400 hover:text-grill-gold hover:bg-grill-card transition-colors"
            >
              <ShieldCheck className="w-5 h-5" />
            </Link>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-grill-card focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-grill-dark border-b border-grill-border px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Link
              href="/menu"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-grill-card border border-grill-border text-grill-gold font-semibold text-xs text-center"
            >
              <UtensilsCrossed className="w-4 h-4 text-grill-orange" />
              Order Food Now
            </Link>
            <a
              href="https://wa.me/923141915087"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-emerald-950/60 border border-emerald-600/40 text-emerald-400 font-semibold text-xs text-center"
            >
              <Flame className="w-4 h-4 text-emerald-400" />
              WhatsApp Direct
            </a>
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive(link.href)
                    ? 'text-grill-gold bg-grill-card border border-grill-gold/30'
                    : 'text-zinc-300 hover:bg-grill-card hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-grill-border/60 flex flex-col gap-2 text-xs text-zinc-400">
            <div className="flex items-center gap-2 text-zinc-300">
              <MapPin className="w-3.5 h-3.5 text-grill-gold" />
              <span>Main GT Road, near Sunny Pan Shop, Baghbanpura, Lahore</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <a href="tel:+923141915087" className="text-grill-gold font-bold">
                Call: +92 314 1915087
              </a>
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-zinc-400 hover:text-grill-gold flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Admin Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
