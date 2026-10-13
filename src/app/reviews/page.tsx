'use client';

import React, { useState, useEffect } from 'react';
import { Review } from '@/types';
import StarRating from '@/components/StarRating';
import {
  MessageSquarePlus,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [dishRecommended, setDishRecommended] = useState('');
  const [orderId, setOrderId] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch('/api/reviews');
        const data = await res.json();
        if (data.reviews) {
          setReviews(data.reviews);
        }
      } catch (e) {
        console.error('Failed to load reviews:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!customerName.trim() || !comment.trim()) {
      setErrorMessage('Please provide your name and review message.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          rating,
          comment: comment.trim(),
          dishRecommended: dishRecommended.trim() || undefined,
          orderId: orderId.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review.');
      }

      setSuccessMessage(data.message);
      setCustomerName('');
      setComment('');
      setDishRecommended('');
      setOrderId('');
      setRating(5);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Error submitting review.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header & Historical Google Rating Hero */}
      <div className="p-8 sm:p-12 rounded-3xl bg-grill-card border border-grill-border flex flex-col md:flex-row items-center justify-between gap-8 shadow-card">
        <div className="space-y-4 text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-grill-gold flex items-center justify-center md:justify-start gap-1.5">
            <Sparkles className="w-4 h-4" /> DINER TESTIMONIALS & RATINGS
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-heading">
            Customer Reviews & Experiences
          </h1>
          <p className="text-sm text-zinc-300 max-w-xl leading-relaxed">
            Read what food lovers across Lahore say about GRILLVI&apos;s live charcoal platters, authentic karahis, and grand Thaal feasts.
          </p>
        </div>

        {/* Historical Google Rating Badge */}
        <div className="p-6 rounded-2xl bg-grill-dark border border-grill-gold/40 text-center space-y-3 min-w-[260px] shadow-gold">
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-black text-white font-mono">4.8</span>
            <div className="text-left">
              <StarRating rating={5} size="sm" />
              <span className="text-[11px] text-zinc-400 block mt-0.5">out of 5 stars</span>
            </div>
          </div>
          <p className="text-xs text-zinc-300">
            Historical rating recorded from <strong>88 Google Reviews</strong>
          </p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Grillvi+Main+Grand+Trunk+Road+Baghbanpura+Lahore+Pakistan"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-grill-gold transition-colors w-full border border-zinc-700"
          >
            <span>View on Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-grill-border">
            <h2 className="text-xl font-bold text-white font-heading">
              Published Reviews ({reviews.length})
            </h2>
            <span className="text-xs text-zinc-500">Moderated & Verified</span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-grill-card animate-pulse" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-8 rounded-2xl bg-grill-card text-center text-zinc-400">
              No approved reviews yet. Be the first to share your experience!
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-6 rounded-2xl bg-grill-card border border-grill-border space-y-3 hover:border-grill-gold/40 transition-colors shadow-card"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white font-heading">
                        {rev.customerName}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={rev.rating} size="sm" />
                        <span className="text-[11px] text-zinc-400">
                          {rev.source === 'google_historical'
                            ? 'Google Maps Review'
                            : 'Website Customer Review'}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] text-zinc-500 font-mono">
                      {new Date(rev.createdAt).toLocaleDateString('en-PK', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-300 leading-relaxed italic">
                    &ldquo;{rev.comment}&rdquo;
                  </p>

                  {rev.dishRecommended && (
                    <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-1.5 text-xs text-grill-gold font-medium">
                      <span>Recommended dish:</span>
                      <strong className="text-white">{rev.dishRecommended}</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Submit Review Form */}
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-grill-card border border-grill-border space-y-5 shadow-card">
            <div className="flex items-center gap-2 pb-3 border-b border-grill-border">
              <MessageSquarePlus className="w-5 h-5 text-grill-gold" />
              <h3 className="text-lg font-bold text-white font-heading">
                Leave Your Review
              </h3>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Dined with us or ordered home delivery? Tell us how your BBQ, karahi and service was!
            </p>

            {successMessage && (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-950/80 border border-red-700 text-red-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-300 font-semibold block mb-1">
                  Your Rating
                </label>
                <div className="p-2.5 rounded-xl bg-grill-dark border border-zinc-800 flex items-center justify-between">
                  <StarRating
                    rating={rating}
                    interactive
                    onRatingChange={setRating}
                    size="md"
                  />
                  <span className="font-bold text-grill-gold font-mono">{rating} / 5</span>
                </div>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">
                  Your Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bilal Ahmed"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-grill-dark border border-zinc-800 focus:border-grill-gold focus:outline-none text-white text-xs"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">
                  Favorite Dish Recommended
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grillvi Special Thaal / Chicken White Karahi"
                  value={dishRecommended}
                  onChange={(e) => setDishRecommended(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-grill-dark border border-zinc-800 focus:border-grill-gold focus:outline-none text-white text-xs"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">
                  Order ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. GV-2610-8421"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-grill-dark border border-zinc-800 focus:border-grill-gold focus:outline-none text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">
                  Your Feedback <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us what you liked about the food, taste, tenderness, packaging, or delivery..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-grill-dark border border-zinc-800 focus:border-grill-gold focus:outline-none text-white text-xs leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-grill-orange to-grill-red hover:from-grill-orange-light text-white font-bold text-xs shadow-orangeGlow transition-all"
              >
                {submitting ? 'Submitting Review...' : 'Submit Review for Approval'}
              </button>

              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-grill-gold flex-shrink-0" />
                <span>
                  All submitted reviews undergo anti-spam moderation by GRILLVI management.
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
