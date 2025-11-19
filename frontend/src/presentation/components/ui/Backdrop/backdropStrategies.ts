/**
 * Backdrop Component Style Strategies
 */

import { mergeClassNames } from '@/shared/utils';

const BASE_STYLES = 'fixed inset-0 bg-black/80 transition-all duration-300';

export const getBackdropClassName = (
  blur: boolean = true,
  zIndex: number = 40,
  customClassName?: string
): string => {
  const blurClass = blur ? 'backdrop-blur-sm' : '';
  const zIndexClass = `z-[${zIndex}]`;

  return mergeClassNames(BASE_STYLES, blurClass, zIndexClass, customClassName);
};
