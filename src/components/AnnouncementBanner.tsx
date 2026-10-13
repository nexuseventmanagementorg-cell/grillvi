'use client';

import React from 'react';
import { Flame, Sparkles } from 'lucide-react';

export default function AnnouncementBanner() {
  return (
    <div className="bg-gradient-to-r from-grill-orange-dark via-grill-orange to-grill-red text-white py-2 px-4 text-xs sm:text-sm font-medium border-b border-grill-orange/40 relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center">
        <span className="inline-flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full text-grill-gold font-bold text-[10px] tracking-wider uppercase border border-grill-gold/30">
          <Flame className="w-3 h-3 text-grill-gold animate-pulse" />
          FRESH LIVE BBQ
        </span>
        <span className="hidden sm:inline text-white/90">
          Serving authentic live BBQ, spiced rice Thaals & handi karahi on Main GT Road, Lahore!
        </span>
        <span className="sm:hidden text-white/90">
          Authentic BBQ, Rice & Karahi on Main GT Road, Lahore!
        </span>
        <span className="text-grill-gold-light font-bold flex items-center gap-1 ml-1 underline decoration-grill-gold underline-offset-2">
          Order Online & WhatsApp <Sparkles className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}
