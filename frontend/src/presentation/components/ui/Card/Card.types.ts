/**
 * Card Component Types
 */

export type CardVariant = 'default' | 'elevated' | 'outlined';
export type CardPadding = 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card style variant */
  variant?: CardVariant;
  /** Internal padding */
  padding?: CardPadding;
  /** Card content */
  children: React.ReactNode;
  /** Optional CSS class override */
  className?: string;
}
