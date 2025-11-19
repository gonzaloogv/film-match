/**
 * Avatar Helper Functions
 * Utilities for working with user avatars
 */

import { AVAILABLE_AVATARS, DEFAULT_AVATAR, type AvatarOption } from '../constants/avatars';

/**
 * Get avatar option by ID
 * @param avatarId - The ID of the avatar
 * @returns AvatarOption or default avatar if not found
 */
export const getAvatarById = (avatarId?: string): AvatarOption => {
  if (!avatarId) return DEFAULT_AVATAR;

  const avatar = AVAILABLE_AVATARS.find(a => a.id === avatarId);
  return avatar || DEFAULT_AVATAR;
};

/**
 * Get avatar image path by ID
 * @param avatarId - The ID of the avatar
 * @returns Image path string
 */
export const getAvatarImage = (avatarId?: string): string => {
  return getAvatarById(avatarId).image;
};
