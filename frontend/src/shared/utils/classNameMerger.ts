/**
 * Utility function to safely merge Tailwind CSS class names
 * Removes duplicates and trim whitespace
 */

export const mergeClassNames = (...classes: (string | undefined | null | boolean)[]): string => {
  return classes
    .filter((className) => typeof className === 'string' && className.trim().length > 0)
    .join(' ')
    .trim();
};

/**
 * Conditionally apply class names
 * Useful for dynamic styling with Tailwind
 */
export const conditionalClass = (
  condition: boolean,
  trueClass: string,
  falseClass: string = ''
): string => {
  return condition ? trueClass : falseClass;
};

/**
 * Create style strategies easily
 * Returns a record of variant names to class strings
 */
export const createVariantStrategy = <T extends string>(
  variants: Record<T, string>
): Record<T, string> => variants;

/**
 * Get variant class or fallback to default
 */
export const getVariantClass = <T extends string>(
  variants: Record<T, string>,
  variant: T,
  defaultVariant: T
): string => {
  return variants[variant] || variants[defaultVariant];
};
