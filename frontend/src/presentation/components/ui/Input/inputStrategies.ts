/**
 * Input Component Style Strategies
 */

import { mergeClassNames } from '@/shared/utils';
import type { InputVariant, InputSize } from './Input.types';

const BASE_STYLES =
  'w-full rounded-lg outline-none transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-primary-pink disabled:opacity-50 disabled:cursor-not-allowed';

export const INPUT_VARIANT_STRATEGIES: Record<InputVariant, string> = {
  default: 'bg-dark-input text-white border border-dark-input focus:border-primary-pink placeholder-gray-500',
  filled: 'bg-dark-card text-white border-b-2 border-dark-input focus:border-b-primary-pink placeholder-gray-400',
  underlined: 'bg-transparent text-white border-b-2 border-dark-input focus:border-b-primary-pink placeholder-gray-400',
};

export const INPUT_SIZE_STRATEGIES: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-5 py-3.5 text-lg',
};

export const getInputClassName = (
  variant: InputVariant = 'default',
  size: InputSize = 'md',
  error: boolean = false,
  customClassName?: string
): string => {
  const variantClass = INPUT_VARIANT_STRATEGIES[variant] || INPUT_VARIANT_STRATEGIES.default;
  const sizeClass = INPUT_SIZE_STRATEGIES[size] || INPUT_SIZE_STRATEGIES.md;
  const errorClass = error ? 'border-rose-500 focus:ring-rose-500' : '';

  return mergeClassNames(BASE_STYLES, variantClass, sizeClass, errorClass, customClassName);
};
