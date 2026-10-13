'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 1 to 5
  max?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({
  rating,
  max = 5,
  interactive = false,
  onRatingChange,
  size = 'md',
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  }[size];

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange && onRatingChange(starValue)}
            className={`${
              interactive ? 'cursor-pointer transition-transform hover:scale-125' : 'cursor-default'
            } focus:outline-none`}
            aria-label={`${starValue} Stars`}
          >
            <Star
              className={`${sizeClasses} ${
                isFilled
                  ? 'fill-grill-gold text-grill-gold drop-shadow-[0_0_8px_rgba(229,169,60,0.6)]'
                  : 'text-zinc-600 fill-zinc-800'
              } transition-colors`}
            />
          </button>
        );
      })}
    </div>
  );
}
