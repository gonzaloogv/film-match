/**
 * UserProvider
 *
 * Provider component for UserContext
 * Now uses React Query with useAuth hook for authentication
 * Simplifies to only manage local UI state, delegates to server state management
 */

import React, { useCallback, ReactNode } from 'react';
import { useAuth } from '@/hooks/api';
import { authService } from '@/api/services/auth.service';
import { UserContext, initialUserState, type UserProfile } from './UserContext';

/**
 * Provider Props
 */
interface UserProviderProps {
  children: ReactNode;
}

/**
 * UserProvider Component
 * Delegates authentication to useAuth (React Query)
 * Only manages derived/local state
 */
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const {
    currentUser,
    isLoadingUser,
    isUserError,
    userError,
    isAuthenticated,
    loginWithGoogle,
    isLoggingIn,
    loginError,
    logout,
    isLoggingOut,
  } = useAuth();

  // Convert UserDTO to UserProfile for backward compatibility
  const userProfile: UserProfile | null = currentUser
    ? {
        id: String(currentUser.id),
        email: currentUser.email,
        name: currentUser.name || currentUser.username || 'Usuario',
        nickname: currentUser.nickname || currentUser.username || 'usuario',
        avatar: currentUser.profilePicture || currentUser.picture || undefined,
        bio: currentUser.bio || undefined,
        twitterUrl: currentUser.twitterUrl || undefined,
        instagramUrl: currentUser.instagramUrl || undefined,
        createdAt: currentUser.createdAt ? new Date(currentUser.createdAt) : new Date(),
      } as UserProfile
    : null;

  // Update user profile by calling backend API
  const updateProfile = useCallback(async (profile: Partial<UserProfile>) => {
    try {
      console.log('📝 Updating profile:', profile);

      // Map UserProfile to API format
      const updateData = {
        nickname: profile.nickname,
        bio: profile.bio,
        profilePicture: profile.avatar, // Map avatar to profilePicture for API
        twitterUrl: profile.twitterUrl,
        instagramUrl: profile.instagramUrl,
      };

      // Call backend API
      await authService.updateUserProfile(updateData);

      // The useAuth hook will automatically refetch the user via React Query
      // because the PUT request triggers a cache invalidation or refetch
      console.log('✅ Profile updated successfully');
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      throw error;
    }
  }, []);

  // Map React Query state to the old context interface
  const value = {
    isAuthenticated,
    user: userProfile,
    loading: isLoadingUser || isLoggingIn,
    error: userError || loginError || (isUserError ? new Error('Failed to load user') : null),

    // Actions
    login: async (_email: string, _password: string) => {
      // TODO: Implement email/password login when backend supports it
      throw new Error('Email/password login not yet implemented');
    },
    loginWithGoogle: async () => {
      // Get Google auth URL first
      loginWithGoogle(''); // Will need token from OAuth flow
    },
    logout: () => {
      logout();
      return Promise.resolve();
    },
    register: async (_email: string, _password: string) => {
      // TODO: Implement registration when backend supports it
      throw new Error('Registration not yet implemented');
    },
    updateProfile,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
