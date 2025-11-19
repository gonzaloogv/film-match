/**
 * Modal Component Style Strategies
 */

import { mergeClassNames } from '@/shared/utils';
import type { ModalSize } from './Modal.types';

const BASE_STYLES = 'rounded-2xl bg-dark-card shadow-2xl shadow-primary-pink/20 border border-primary-pink/30';

export const MODAL_SIZE_STRATEGIES: Record<ModalSize, string> = {
  sm: 'w-full max-w-sm',
  md: 'w-full max-w-md',
  lg: 'w-full max-w-2xl',
};

export const getModalClassName = (
  size: ModalSize = 'md',
  customClassName?: string
): string => {
  const sizeClass = MODAL_SIZE_STRATEGIES[size] || MODAL_SIZE_STRATEGIES.md;

  return mergeClassNames(BASE_STYLES, sizeClass, customClassName);
};
