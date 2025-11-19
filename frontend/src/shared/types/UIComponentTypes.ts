/**
 * Centralized UI Component Types
 * Defines all prop interfaces for reusable UI components using Strategy Pattern
 */

/**
 * Button Component Props
 * Supports multiple variants and sizes with Tailwind-based strategies
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Button content */
  children: React.ReactNode;
  /** Optional CSS class override */
  className?: string;
  /** Loading state indicator */
  isLoading?: boolean;
}

/**
 * Card Component Props
 * Flexible container with style variants
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card style variant */
  variant?: 'default' | 'elevated' | 'outlined';
  /** Internal padding */
  padding?: 'sm' | 'md' | 'lg';
  /** Card content */
  children: React.ReactNode;
  /** Optional CSS class override */
  className?: string;
}

/**
 * Input Component Props
 * Form input with validation and variants
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Input style variant */
  variant?: 'default' | 'filled' | 'underlined';
  /** Input size */
  size?: 'sm' | 'md' | 'lg';
  /** Label text for the input */
  label?: string;
  /** Error state indicator */
  error?: boolean;
  /** Helper text below input */
  helperText?: string;
  /** Optional CSS class override */
  className?: string;
}

/**
 * Modal Component Props
 * Dialog modal with backdrop
 */
export interface ModalProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Close on backdrop click */
  closeOnBackdropClick?: boolean;
  /** Modal size */
  size?: 'sm' | 'md' | 'lg';
  /** Optional CSS class override */
  className?: string;
}

/**
 * Backdrop Component Props
 * Semi-transparent overlay behind modals
 */
export interface BackdropProps {
  /** Callback when backdrop is clicked */
  onClick: () => void;
  /** CSS z-index value */
  zIndex?: number;
  /** Apply blur effect */
  blur?: boolean;
  /** Optional CSS class override */
  className?: string;
}

/**
 * Badge Component Props
 * Small label/tag component
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Badge style variant */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  /** Badge size */
  size?: 'sm' | 'md' | 'lg';
  /** Badge content */
  children: React.ReactNode;
  /** Optional CSS class override */
  className?: string;
}

/**
 * RatingStars Component Props
 * Star rating input/display component
 */
export interface RatingStarsProps {
  /** Current rating value (0-5) */
  rating: number;
  /** Callback when rating changes */
  onChange?: (rating: number) => void;
  /** Read-only mode (no interaction) */
  readOnly?: boolean;
  /** Star size */
  size?: 'sm' | 'md' | 'lg';
  /** Number of stars to display */
  count?: number;
  /** Optional CSS class override */
  className?: string;
}

/**
 * IconButton Component Props
 * Button with icon content
 */
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon element (React component) */
  icon: React.ReactNode;
  /** Button style variant */
  variant?: 'default' | 'filled' | 'outlined';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Optional CSS class override */
  className?: string;
}

/**
 * Type for component variant strategies
 * Maps variant names to Tailwind CSS class strings
 */
export type VariantStrategy<T extends string> = Record<T, string>;

/**
 * Type for component size strategies
 * Maps size names to Tailwind CSS class strings
 */
export type SizeStrategy = Record<'sm' | 'md' | 'lg', string>;
