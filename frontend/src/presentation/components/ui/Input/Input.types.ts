/**
 * Input Component Types
 */

export type InputVariant = 'default' | 'filled' | 'underlined';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Input style variant */
  variant?: InputVariant;
  /** Input size */
  size?: InputSize;
  /** Label text for the input */
  label?: string;
  /** Error state indicator */
  error?: boolean;
  /** Helper text below input */
  helperText?: string;
  /** Optional CSS class override */
  className?: string;
}
