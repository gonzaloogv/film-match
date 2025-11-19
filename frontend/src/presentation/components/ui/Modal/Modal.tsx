/**
 * Modal Component
 * Reusable dialog modal with backdrop and animations
 */

import type React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Backdrop } from '../Backdrop/Backdrop';
import { getModalClassName } from './modalStrategies';
import type { ModalProps } from './Modal.types';
import { X } from 'lucide-react';

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  closeOnBackdropClick = true,
  size = 'md',
  className,
}) => {
  const handleBackdropClick = () => {
    if (closeOnBackdropClick) {
      onClose();
    }
  };

  const computedClassName = getModalClassName(size, className);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Backdrop onClick={handleBackdropClick} zIndex={40} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className={computedClassName}
            >
              {title && (
                <div className="flex items-center justify-between p-6 border-b border-primary-pink/30">
                  <h2 className="text-xl font-bold text-white">{title}</h2>
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-dark-input rounded-lg transition-colors"
                    aria-label="Close modal"
                  >
                    <X size={24} className="text-gray-400 hover:text-white" />
                  </button>
                </div>
              )}
              <div className={title ? 'p-6' : 'p-6'}>{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
