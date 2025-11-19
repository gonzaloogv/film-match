/**
 * InfoButton Component
 * Botón flotante que muestra el tutorial de la aplicación
 * Posicionado arriba del botón del chatbot
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';
import { useUI } from '../context/ui';

const InfoButton: React.FC = () => {
  const { openTutorial } = useUI();

  return (
    <AnimatePresence>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={openTutorial}
        className="fixed bottom-6 left-6 w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl z-30 hover:shadow-cyan-500/50 transition-shadow"
        aria-label="Mostrar tutorial"
      >
        <Info className="w-7 h-7 text-white" />
      </motion.button>
    </AnimatePresence>
  );
};

export default InfoButton;
