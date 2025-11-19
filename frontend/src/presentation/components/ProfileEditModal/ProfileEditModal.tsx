/**
 * ProfileEditModal Component
 * Modal para editar el perfil del usuario
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '../ui/Button/Button';
import { useUser } from '../../../context/user/useUser';
import { AVAILABLE_AVATARS } from '../../../shared/constants/avatars';
import { getAvatarImage } from '../../../shared/utils/avatarHelpers';

interface ProfileEditModalProps {
  onClose: () => void;
}

export function ProfileEditModal({ onClose }: ProfileEditModalProps) {
  const { user, updateProfile } = useUser();

  const [formData, setFormData] = useState({
    avatar: user?.avatar || '',
    nickname: user?.nickname || '',
    bio: user?.bio || '',
    twitterUrl: user?.twitterUrl || '',
    instagramUrl: user?.instagramUrl || '',
  });

  const handleSubmit = () => {
    updateProfile(formData);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={handleCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="relative bg-dark-card rounded-3xl p-8 max-w-lg w-full border border-gray-800 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Personalizar Perfil</h2>
          <button
            onClick={handleCancel}
            className="w-10 h-10 rounded-full bg-dark-input flex items-center justify-center hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-300 mb-3">
            Elige tu Avatar
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {AVAILABLE_AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => setFormData({ ...formData, avatar: avatar.id })}
                className={`relative aspect-square rounded-full overflow-hidden transition-all ${
                  formData.avatar === avatar.id
                    ? 'ring-4 ring-primary-pink scale-110'
                    : 'ring-2 ring-gray-700 hover:ring-gray-600 hover:scale-105'
                }`}
              >
                <img
                  src={avatar.image}
                  alt={avatar.name}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Nickname Field */}
        <div className="mb-6">
          <label htmlFor="nickname" className="block text-sm font-semibold text-gray-300 mb-2">
            Apodo
          </label>
          <input
            id="nickname"
            type="text"
            value={formData.nickname}
            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
            className="w-full bg-dark-input text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary-pink transition-all placeholder-gray-500"
            placeholder="Tu apodo de cinéfilo"
          />
        </div>

        {/* Bio/Description Field */}
        <div className="mb-6">
          <label htmlFor="bio" className="block text-sm font-semibold text-gray-300 mb-2">
            Descripción
          </label>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={3}
            className="w-full bg-dark-input text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary-pink transition-all placeholder-gray-500 resize-none"
            placeholder="Cuéntanos sobre ti y tus gustos cinematográficos..."
          />
        </div>

        {/* Twitter URL Field */}
        <div className="mb-6">
          <label htmlFor="twitter" className="block text-sm font-semibold text-gray-300 mb-2">
            Twitter URL
          </label>
          <input
            id="twitter"
            type="url"
            value={formData.twitterUrl}
            onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
            className="w-full bg-dark-input text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary-pink transition-all placeholder-gray-500"
            placeholder="https://twitter.com/tu_usuario"
          />
        </div>

        {/* Instagram URL Field */}
        <div className="mb-8">
          <label htmlFor="instagram" className="block text-sm font-semibold text-gray-300 mb-2">
            Instagram URL
          </label>
          <input
            id="instagram"
            type="url"
            value={formData.instagramUrl}
            onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
            className="w-full bg-dark-input text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary-pink transition-all placeholder-gray-500"
            placeholder="https://instagram.com/tu_usuario"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={handleCancel}
            variant="secondary"
            size="lg"
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="primary"
            size="lg"
            className="flex-1"
          >
            Guardar Cambios
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
