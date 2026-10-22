import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getItems, getReviews } from '@/lib/db';
import DishCard from '@/components/DishCard';
import StarRating from '@/components/StarRating';
import {
  Flame,
  ArrowRight,
  Star,
  Sparkles,
  Utensils,
  Award,
  Users,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const featuredDishes = getItems({ featuredOnly: true }).slice(0, 6);
  const thaalDeals = getItems({ category: 'thaal-collection' }).slice(0, 3);
  const bbqPlatters = getItems({ category: 'bbq-platter' }).slice(0, 3);
  const reviews = getReviews(true).slice(0, 3);

  return (
    <div className="space-y-20 pb-16">
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-dark-radial">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-grill-orange/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-grill-gold/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left Text Column */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-grill-card border border-grill-gold/40 text-xs font-bold text-grill-gold tracking-wide shadow-gold">
              <Flame className="w-3.5 h-3.5 text-grill-orange animate-pulse" />
              <span>FRESHLY PREPARED • MADE TO ORDER</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight font-heading">
              Experience the Taste of{' '}
              <span className="text-gold-gradient block sm:inline">
                Authentic BBQ,
              </span>{' '}
              Rice & Karahi.
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Welcome to <span className="text-white font-semibold">Restaurant Name</span>, where freshly prepared favorites and generous sharing meals are made to order.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/menu"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-grill-orange to-grill-red hover:from-grill-orange-light hover:to-grill-red text-white font-bold text-base shadow-orangeGlow transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
              >
                <span>Order Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/menu"
                className="px-8 py-4 rounded-xl bg-grill-card hover:bg-grill-cardHover text-grill-gold border border-grill-gold/40 font-bold text-base transition-all duration-300 flex items-center gap-2 shadow-card"
              >
                <span>Explore Our Menu</span>
                <Utensils className="w-4 h-4" />
              </Link>

            </div>

            {/* Rating Highlight Pill */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-zinc-400">
              <div className="flex items-center gap-2 bg-grill-dark/80 px-4 py-2 rounded-xl border border-grill-border">
              <Sparkles className="h-4 w-4 text-grill-gold" />
              <span>Freshly prepared to order</span>
              </div>

            </div>
          </div>

          {/* Right Hero Image Card */}
          <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
            <div className="relative mx-auto w-full aspect-[4/3] rounded-3xl overflow-hidden border-2 border-grill-gold/30 shadow-[0_15px_50px_rgba(0,0,0,0.8)] group">
              <Image
                src="/images/family-sharing-thaal.jpg"
                alt="Restaurant sharing meal"
                fill
                priority
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

              {/* Floating Badge on Image */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-grill-gold uppercase">
                    SIGNATURE MASTERPIECE
                  </span>
                  <h3 className="text-white font-heading font-bold text-lg">
                    Signature Sharing Thaal
                  </h3>
                  <p className="text-xs text-zinc-300">
                    Spiced Rice + 20 Charcoal BBQ Skewers + Sauces & Nuts
                  </p>
                </div>
                <span className="text-xl font-mono font-black text-grill-gold">
                  Rs 4,499
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RESTAURANT VALUE PROPOSITIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-grill-card border border-grill-border hover:border-grill-gold/40 transition-colors space-y-3">
            <div className="w-12 h-12 rounded-xl bg-grill-orange/15 text-grill-orange flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-heading">
              100% Live Charcoal Grills
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Never pre-cooked or microwaved. Every seekh kabab and tender chicken boti is grilled over glowing natural coals right when you order.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-grill-card border border-grill-border hover:border-grill-gold/40 transition-colors space-y-3">
            <div className="w-12 h-12 rounded-xl bg-grill-gold/15 text-grill-gold flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-heading">
              Authentic Lahori Desi Recipes
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Traditional cast-iron wok karahis with real tomatoes, ginger juliennes and aromatic desi spices. True GT Road culinary heritage.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-grill-card border border-grill-border hover:border-grill-gold/40 transition-colors space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-heading">
              Family Feasts & Royal Thaals
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Designed for gathering and sharing. Our monumental Thaal Collection feeds from 2 to 8 guests with generous variety and exquisite presentation.
            </p>
          </div>
        </div>
      </section>

      {/* SIGNATURE THAAL COLLECTION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-grill-gold text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" /> Royal Feast Collection
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-heading">
              The Grand Thaal Deals
            </h2>
            <p className="text-sm text-zinc-400 mt-1 max-w-xl">
              Fragrant saffron rice surrounded by sizzling Malai Boti, Seekh Kebabs, Turkish skewers, roasted veggies and crunchy dry nuts.
            </p>
          </div>
          <Link
            href="/menu?category=thaal-collection"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-grill-gold hover:text-grill-gold-light"
          >
            <span>View All Thaals</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {thaalDeals.map((dish) => (
            <DishCard key={dish.id} item={dish} />
          ))}
          {reviews.length === 0 && (
            <p className="md:col-span-3 rounded-2xl border border-grill-border bg-grill-card p-6 text-center text-sm text-zinc-400">
              Customer reviews will appear here once they are approved.
            </p>
          )}
        </div>
      </section>

      {/* POPULAR BBQ PLATTERS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-grill-orange text-xs font-bold uppercase tracking-wider mb-2">
              <Flame className="w-4 h-4" /> Live Charcoal Assortments
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-heading">
              Popular BBQ Platters
            </h2>
            <p className="text-sm text-zinc-400 mt-1 max-w-xl">
              Generous combinations of juicy Seekh Kebabs, Turkish skewers, and creamy Malai Boti.
            </p>
          </div>
          <Link
            href="/menu?category=bbq-platter"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-grill-gold hover:text-grill-gold-light"
          >
            <span>View All Platters</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {bbqPlatters.map((dish) => (
            <DishCard key={dish.id} item={dish} />
          ))}
        </div>
      </section>

      {/* FEATURED BBQ PLATTERS & DISHES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-grill-orange text-xs font-bold uppercase tracking-wider mb-2">
              <Flame className="w-4 h-4" /> Chef&apos;s Special Selections
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-heading">
              Popular Dishes & Platters
            </h2>
            <p className="text-sm text-zinc-400 mt-1 max-w-xl">
              Explore freshly prepared favorites and sharing meals from our menu.
            </p>
          </div>
          <Link
            href="/menu"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-grill-gold hover:text-grill-gold-light"
          >
            <span>Browse Full Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredDishes.map((dish) => (
            <DishCard key={dish.id} item={dish} />
          ))}
        </div>
      </section>

      {/* SIZZLING CHICKEN KARAHI BANNER HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-grill-card via-zinc-900 to-grill-card border border-grill-border p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-8 shadow-2xl">
          <div className="flex-1 space-y-4 text-center lg:text-left">
            <span className="text-xs font-bold tracking-widest text-grill-gold uppercase">
              PAKISTANI CORNER
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-heading">
              Fresh Lahori Chicken Karahi
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl">
              Cooked in heavy iron wok with fresh cut tomatoes, green chillies, and ginger slivers. Available in traditional Half (Rs 899) and Full (Rs 1,899) portions, served with steaming hot Roghni or Garlic Naans.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/menu?category=pakistani-corner"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-grill-orange to-grill-red text-white font-bold text-sm shadow-orangeGlow hover:from-grill-orange-light transition-all"
              >
                Order Karahi Now
              </Link>
              <span className="font-mono text-xl font-black text-grill-gold">
                From Rs 899
              </span>
            </div>
          </div>

          <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden border border-grill-gold/30 shadow-xl flex-shrink-0">
            <Image
              src="/images/chicken-karahi.jpg"
              alt="Fresh sizzling chicken karahi"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* CUSTOMER REVIEWS & HISTORICAL GOOGLE RATING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-grill-card border border-grill-gold/30 text-xs font-bold text-grill-gold">
            <Star className="w-3.5 h-3.5 fill-grill-gold" />
            <span>GUEST REVIEWS ({reviews.length})</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white font-heading">
            What Our Guests Say
          </h2>
          <p className="text-sm text-zinc-400">
            See what guests have to say about their experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-2xl bg-grill-card border border-grill-border flex flex-col justify-between space-y-4 hover:border-grill-gold/40 transition-colors shadow-card"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <StarRating rating={rev.rating} size="sm" />
                  <span className="text-[10px] text-zinc-500 font-medium">Guest Review</span>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{rev.customerName}</h4>
                  {rev.dishRecommended && (
                    <span className="text-[11px] text-grill-gold font-medium">
                      Loved: {rev.dishRecommended}
                    </span>
                  )}
                </div>
                <div className="w-8 h-8 rounded-full bg-grill-dark flex items-center justify-center text-grill-gold font-bold text-xs border border-grill-border">
                  {rev.customerName.charAt(0)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 text-sm font-bold text-grill-gold hover:text-grill-gold-light transition-colors"
          >
            <span>Read more customer reviews & leave your feedback</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
