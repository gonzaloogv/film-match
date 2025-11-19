/**
 * RatingStars Component
 * Interactive star rating display/input component
 */

import type React from 'react';
import { useState } from 'react';
import { Star } from 'lucide-react';
import { getRatingClassName } from './ratingStrategies';
import type { RatingStarsProps } from './RatingStars.types';

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  onChange,
  readOnly = false,
  size = 'md',
  count = 5,
  className,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating !== null ? hoverRating : rating;
  const starClassName = getRatingClassName(size, className);

  return (
    <div
      className="flex gap-1"
      onMouseLeave={() => !readOnly && setHoverRating(null)}
    >
      {Array.from({ length: count }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHoverRating(star)}
          disabled={readOnly}
          className={`transition-transform ${!readOnly && 'hover:scale-110 cursor-pointer'} ${
            readOnly && 'cursor-default'
          }`}
          aria-label={`Rate ${star} stars`}
        >
          <Star
            className={starClassName}
            fill={star <= displayRating ? '#ff005a' : 'none'}
            stroke={star <= displayRating ? '#ff005a' : 'currentColor'}
            strokeWidth={2}
          />
        </button>
      ))}
    </div>
  );
};
