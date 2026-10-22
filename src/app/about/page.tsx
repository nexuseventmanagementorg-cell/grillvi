import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Flame, Utensils, Sparkles, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-grill-card border border-grill-gold/40 text-xs font-bold text-grill-gold">
          <Flame className="w-3.5 h-3.5 text-grill-orange animate-pulse" />
          <span>OUR STORY</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white font-heading">
          About Restaurant Name
        </h1>
        <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
          Share your restaurant story, signature dishes, and the experience guests can expect.
        </p>
      </div>

      {/* Main Story & Interior Sign Image */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 text-sm sm:text-base text-zinc-300 leading-relaxed">
          <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
            Made Fresh, Served with Care
          </h2>
          <p>
            <strong className="text-white">Restaurant Name</strong> is a customizable restaurant profile. Replace this introduction with your own history, values, and what makes your kitchen special.
          </p>
          <p>
            Our core philosophy is simple: <strong className="text-grill-gold">Never pre-cook, never microwave, and never cut corners on meat quality.</strong> Every single skewer of Chicken Malai Boti, every beef seekh kabab, and every sizzling wok of Chicken Karahi is prepared fresh to your order over live natural charcoal embers.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-grill-card border border-grill-border">
              <span className="font-mono text-2xl font-black text-grill-gold block">
                100%
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                Fresh & Halal Ingredients
              </span>
            </div>
            <div className="p-4 rounded-xl bg-grill-card border border-grill-border">
              <span className="font-mono text-2xl font-black text-grill-orange block">
                Live Coal
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                Authentic Flame Smoking
              </span>
            </div>
          </div>
        </div>

        {/* Interior Sign Image */}
        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-grill-border shadow-2xl bg-zinc-900">
          <Image
            src="/images/chicken-karahi.jpg"
            alt="Restaurant signature sharing meal"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* The 3 Pillars: BBQ, RICE, KARAHI */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-grill-gold">
            THE HOLY TRINITY
          </span>
          <h2 className="text-3xl font-black text-white font-heading">
            BBQ. RICE. KARAHI.
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Why our tagline defines our identity and craft.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-grill-card border border-grill-border space-y-4 hover:border-grill-gold/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-grill-orange/20 text-grill-orange flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white font-heading">BBQ</h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Tender chicken boti marinated in curd, garlic, and fresh ground spices; Turkish kebabs infused with sweet capsicum; and velvety cream-soaked Malai Boti that melts in your mouth.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-grill-card border border-grill-border space-y-4 hover:border-grill-gold/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-grill-gold/20 text-grill-gold flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white font-heading">RICE</h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Our signature royal spiced long-grain basmati rice, steamed in fragrant cardamom and clove broths, crowned with roasted dry fruit nuts, roasted vegetables, and secret sauces.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-grill-card border border-grill-border space-y-4 hover:border-grill-gold/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-grill-red/20 text-grill-red flex items-center justify-center">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white font-heading">KARAHI</h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Sizzling iron wok dishes made with fresh ripe tomatoes, green chillies, ginger slivers and desi butter. Rich, spicy, and perfectly paired with hot Roghni and Garlic Naans.
            </p>
          </div>
        </div>
      </div>

      {/* Family Thaal Presentation Card */}
      <div className="p-8 sm:p-12 rounded-3xl bg-grill-card border border-grill-border grid grid-cols-1 lg:grid-cols-2 gap-8 items-center shadow-card">
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-grill-gold/30 shadow-xl bg-zinc-900">
          <Image
            src="/images/family-sharing-thaal.jpg"
            alt="Family sharing thaal"
            fill
            className="object-cover"
          />
        </div>

        <div className="space-y-4">
          <span className="text-xs font-bold tracking-widest text-grill-gold uppercase">
            A ROYAL SHARING EXPERIENCE
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
            The Legend of the Thaal Feasts
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            In Pakistani culture, nothing brings families closer than eating together from a single grand platter. Our Thaal Collection was born out of this spirit — combining fragrant rice, assorted skewers, salads, roasted nuts and sauces in an unforgettable feast for 2 to 8 guests.
          </p>
          <div className="pt-2">
            <Link
              href="/menu?category=thaal-collection"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-grill-orange to-grill-red text-white font-bold text-xs shadow-orangeGlow hover:from-grill-orange-light transition-all"
            >
              <span>Explore Thaal Feasts</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Template Setup Prompt */}
      <div className="p-8 rounded-3xl bg-grill-dark border border-grill-border text-center space-y-4 max-w-2xl mx-auto">
      <h3 className="text-xl font-bold text-white font-heading">
        Tell Your Restaurant Story
      </h3>
      <p className="text-xs sm:text-sm text-zinc-400">
        Customize this page with your restaurant&apos;s location-free introduction and signature offerings.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        <Link
          href="/admin/login"
          className="px-6 py-3 rounded-xl bg-grill-card hover:bg-zinc-800 text-grill-gold border border-grill-gold/40 font-bold text-xs transition-colors"
        >
          Open Admin Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
