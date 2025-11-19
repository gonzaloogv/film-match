/**
 * UIContext
 *
 * Context for managing UI state (modals, sidebars, notifications)
 *
 * @responsibility Manage transient UI state
 * @architecture_layer Presentation - State Management
 */

import { createContext } from 'react';
import type { Movie } from '@core';

/**
 * UI State Interface
 */
export interface UIState {
  // Modals
  matchModal: {
    isOpen: boolean;
    movie: Movie | null;
  };
  ratingModal: {
    isOpen: boolean;
    movie: Movie | null;
  };

  // Sidebars
  filtersSidebar: {
    isOpen: boolean;
  };

  // Chatbot
  chatbotOpen: boolean;

  // Tutorial
  tutorialOpen: boolean;

  // Profile Edit Modal
  profileEditModalOpen: boolean;

  // Notifications/Toasts
  notifications: Notification[];
}

/**
 * Notification Interface
 */
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

/**
 * UI Actions Interface
 */
export interface UIActions {
  // Match Modal
  openMatchModal: (movie: Movie) => void;
  closeMatchModal: () => void;

  // Rating Modal
  openRatingModal: (movie: Movie) => void;
  closeRatingModal: () => void;

  // Filters Sidebar
  openFiltersSidebar: () => void;
  closeFiltersSidebar: () => void;
  toggleFiltersSidebar: () => void;

  // Chatbot
  openChatbot: () => void;
  closeChatbot: () => void;
  toggleChatbot: () => void;

  // Tutorial
  openTutorial: () => void;
  closeTutorial: () => void;

  // Profile Edit Modal
  openProfileEditModal: () => void;
  closeProfileEditModal: () => void;

  // Notifications
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;
}

/**
 * Combined Context Interface
 */
export interface UIContextValue extends UIState, UIActions {}

/**
 * Initial State
 */
export const initialUIState: UIState = {
  matchModal: {
    isOpen: false,
    movie: null,
  },
  ratingModal: {
    isOpen: false,
    movie: null,
  },
  filtersSidebar: {
    isOpen: false,
  },
  chatbotOpen: false,
  tutorialOpen: false,
  profileEditModalOpen: false,
  notifications: [],
};

/**
 * UI Context
 */
export const UIContext = createContext<UIContextValue | undefined>(undefined);
