'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MenuItem, Category } from '@/types';
import DishCard from '@/components/DishCard';
import { Search, Flame, UtensilsCrossed } from 'lucide-react';

function MenuContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';

  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(categoryParam);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Sync activeCategory if URL query param changes
  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [catsRes, itemsRes] = await Promise.all([
          fetch('/api/menu/categories'),
          fetch('/api/menu/items'),
        ]);

        const catsData = await catsRes.json();
        const itemsData = await itemsRes.json();

        if (catsData.categories) setCategories(catsData.categories);
        if (itemsData.items) setItems(itemsData.items);
      } catch (err) {
        console.error('Failed to load menu data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Filter items by category and search
  const filteredItems = items.filter((item) => {
    const matchesCategory =
      activeCategory === 'all' ||
      item.categorySlug === activeCategory ||
      item.categoryId === activeCategory;

    const matchesSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categorySlug.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const currentCategoryObj = categories.find((c) => c.slug === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title & Search Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-grill-border">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-grill-gold flex items-center gap-1.5 mb-1">
            <Flame className="w-3.5 h-3.5 text-grill-orange" />
            FRESH DESI & CHARCOAL SPECIALTIES
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-heading">
            GRILLVI Full Restaurant Menu
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
            Browse authentic live BBQ, spiced rice Thaals, handi karahis, fresh tandoor breads and desserts.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search kebab, karahi, thaal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-grill-card border border-grill-border focus:border-grill-gold focus:outline-none text-white text-sm placeholder:text-zinc-500 shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Categories Horizontal Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-thin">
        <button
          onClick={() => setActiveCategory('all')}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeCategory === 'all'
              ? 'bg-gradient-to-r from-grill-orange to-grill-red text-white shadow-orangeGlow font-bold'
              : 'bg-grill-card text-zinc-300 hover:bg-zinc-800 border border-grill-border hover:text-white'
          }`}
        >
          All Items ({items.length})
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.slug)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeCategory === cat.slug
                ? 'bg-grill-gold text-grill-black font-bold shadow-gold'
                : 'bg-grill-card text-zinc-300 hover:bg-zinc-800 border border-grill-border hover:text-white'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Category Banner / Description */}
      {currentCategoryObj && (
        <div className="p-4 sm:p-5 rounded-2xl bg-grill-card border border-grill-border/80 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white font-heading">
              {currentCategoryObj.name}
            </h2>
            {currentCategoryObj.description && (
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                {currentCategoryObj.description}
              </p>
            )}
          </div>
          <span className="text-xs font-mono font-bold text-grill-gold bg-black/40 px-3 py-1 rounded-full border border-grill-gold/20">
            {filteredItems.length} dishes
          </span>
        </div>
      )}

      {/* Menu Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-72 rounded-2xl bg-grill-card border border-grill-border animate-pulse"
            />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-16 rounded-3xl bg-grill-card border border-grill-border text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <UtensilsCrossed className="w-8 h-8 text-grill-gold/40" />
          </div>
          <h3 className="text-lg font-bold text-white font-heading">
            No dishes found matching your query
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Try checking for different spellings or reset the search query to view all items.
          </p>
          <button
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
            }}
            className="px-5 py-2.5 rounded-xl bg-grill-orange text-white text-xs font-bold hover:bg-grill-orange-light transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <DishCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-zinc-400">
          Loading GRILLVI Menu...
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
