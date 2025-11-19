/**
 * IconButton Component Types
 */

export type IconButtonVariant = 'default' | 'filled' | 'outlined';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon element (React component) */
  icon: React.ReactNode;
  /** Button style variant */
  variant?: IconButtonVariant;
  /** Button size */
  size?: IconButtonSize;
  /** Optional CSS class override */
  className?: string;
}
