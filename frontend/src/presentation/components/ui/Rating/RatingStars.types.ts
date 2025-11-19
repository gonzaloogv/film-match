/**
 * RatingStars Component Types
 */

export type RatingSize = 'sm' | 'md' | 'lg';

export interface RatingStarsProps {
  /** Current rating value (0-5) */
  rating: number;
  /** Callback when rating changes */
  onChange?: (rating: number) => void;
  /** Read-only mode (no interaction) */
  readOnly?: boolean;
  /** Star size */
  size?: RatingSize;
  /** Number of stars to display */
  count?: number;
  /** Optional CSS class override */
  className?: string;
}
