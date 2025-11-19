/**
 * Modal Component Types
 */

export type ModalSize = 'sm' | 'md' | 'lg';

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
  size?: ModalSize;
  /** Optional CSS class override */
  className?: string;
}
