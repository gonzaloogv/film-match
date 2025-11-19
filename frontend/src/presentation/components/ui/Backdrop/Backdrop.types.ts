/**
 * Backdrop Component Types
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
