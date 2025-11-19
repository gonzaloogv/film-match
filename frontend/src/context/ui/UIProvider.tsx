/**
 * UIProvider
 *
 * Provider component for UIContext
 * Manages transient UI state
 */

import React, { useReducer, useCallback, useEffect, ReactNode } from 'react';
import { UIContext, initialUIState, type UIState, type Notification } from './UIContext';
import type { Movie } from '@core';

/**
 * Action Types
 */
type UIAction =
  // Match Modal
  | { type: 'OPEN_MATCH_MODAL'; payload: Movie }
  | { type: 'CLOSE_MATCH_MODAL' }
  // Rating Modal
  | { type: 'OPEN_RATING_MODAL'; payload: Movie }
  | { type: 'CLOSE_RATING_MODAL' }
  // Filters Sidebar
  | { type: 'OPEN_FILTERS_SIDEBAR' }
  | { type: 'CLOSE_FILTERS_SIDEBAR' }
  | { type: 'TOGGLE_FILTERS_SIDEBAR' }
  // Chatbot
  | { type: 'OPEN_CHATBOT' }
  | { type: 'CLOSE_CHATBOT' }
  | { type: 'TOGGLE_CHATBOT' }
  // Tutorial
  | { type: 'OPEN_TUTORIAL' }
  | { type: 'CLOSE_TUTORIAL' }
  // Profile Edit Modal
  | { type: 'OPEN_PROFILE_EDIT_MODAL' }
  | { type: 'CLOSE_PROFILE_EDIT_MODAL' }
  // Notifications
  | { type: 'SHOW_NOTIFICATION'; payload: Notification }
  | { type: 'DISMISS_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' };

/**
 * Reducer Function
 */
function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    // Match Modal
    case 'OPEN_MATCH_MODAL':
      return {
        ...state,
        matchModal: {
          isOpen: true,
          movie: action.payload,
        },
      };

    case 'CLOSE_MATCH_MODAL':
      return {
        ...state,
        matchModal: {
          isOpen: false,
          movie: null,
        },
      };

    // Rating Modal
    case 'OPEN_RATING_MODAL':
      return {
        ...state,
        ratingModal: {
          isOpen: true,
          movie: action.payload,
        },
      };

    case 'CLOSE_RATING_MODAL':
      return {
        ...state,
        ratingModal: {
          isOpen: false,
          movie: null,
        },
      };

    // Filters Sidebar
    case 'OPEN_FILTERS_SIDEBAR':
      return {
        ...state,
        filtersSidebar: { isOpen: true },
      };

    case 'CLOSE_FILTERS_SIDEBAR':
      return {
        ...state,
        filtersSidebar: { isOpen: false },
      };

    case 'TOGGLE_FILTERS_SIDEBAR':
      return {
        ...state,
        filtersSidebar: { isOpen: !state.filtersSidebar.isOpen },
      };

    // Chatbot
    case 'OPEN_CHATBOT':
      return {
        ...state,
        chatbotOpen: true,
      };

    case 'CLOSE_CHATBOT':
      return {
        ...state,
        chatbotOpen: false,
      };

    case 'TOGGLE_CHATBOT':
      return {
        ...state,
        chatbotOpen: !state.chatbotOpen,
      };

    // Tutorial
    case 'OPEN_TUTORIAL':
      return {
        ...state,
        tutorialOpen: true,
      };

    case 'CLOSE_TUTORIAL':
      return {
        ...state,
        tutorialOpen: false,
      };

    // Profile Edit Modal
    case 'OPEN_PROFILE_EDIT_MODAL':
      return {
        ...state,
        profileEditModalOpen: true,
      };

    case 'CLOSE_PROFILE_EDIT_MODAL':
      return {
        ...state,
        profileEditModalOpen: false,
      };

    // Notifications
    case 'SHOW_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };

    case 'DISMISS_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };

    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
      };

    default:
      return state;
  }
}

/**
 * Provider Props
 */
interface UIProviderProps {
  children: ReactNode;
}

/**
 * UIProvider Component
 */
export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, initialUIState);

  // Match Modal Actions
  const openMatchModal = useCallback((movie: Movie) => {
    dispatch({ type: 'OPEN_MATCH_MODAL', payload: movie });
  }, []);

  const closeMatchModal = useCallback(() => {
    dispatch({ type: 'CLOSE_MATCH_MODAL' });
  }, []);

  // Rating Modal Actions
  const openRatingModal = useCallback((movie: Movie) => {
    dispatch({ type: 'OPEN_RATING_MODAL', payload: movie });
  }, []);

  const closeRatingModal = useCallback(() => {
    dispatch({ type: 'CLOSE_RATING_MODAL' });
  }, []);

  // Filters Sidebar Actions
  const openFiltersSidebar = useCallback(() => {
    dispatch({ type: 'OPEN_FILTERS_SIDEBAR' });
  }, []);

  const closeFiltersSidebar = useCallback(() => {
    dispatch({ type: 'CLOSE_FILTERS_SIDEBAR' });
  }, []);

  const toggleFiltersSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_FILTERS_SIDEBAR' });
  }, []);

  // Chatbot Actions
  const openChatbot = useCallback(() => {
    dispatch({ type: 'OPEN_CHATBOT' });
  }, []);

  const closeChatbot = useCallback(() => {
    dispatch({ type: 'CLOSE_CHATBOT' });
  }, []);

  const toggleChatbot = useCallback(() => {
    dispatch({ type: 'TOGGLE_CHATBOT' });
  }, []);

  // Tutorial Actions
  const openTutorial = useCallback(() => {
    dispatch({ type: 'OPEN_TUTORIAL' });
  }, []);

  const closeTutorial = useCallback(() => {
    dispatch({ type: 'CLOSE_TUTORIAL' });
  }, []);

  // Profile Edit Modal Actions
  const openProfileEditModal = useCallback(() => {
    dispatch({ type: 'OPEN_PROFILE_EDIT_MODAL' });
  }, []);

  const closeProfileEditModal = useCallback(() => {
    dispatch({ type: 'CLOSE_PROFILE_EDIT_MODAL' });
  }, []);

  // Notification Actions
  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const notificationWithId: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      duration: notification.duration || 5000,
    };

    dispatch({ type: 'SHOW_NOTIFICATION', payload: notificationWithId });

    // Auto-dismiss after duration
    if (notificationWithId.duration) {
      setTimeout(() => {
        dispatch({ type: 'DISMISS_NOTIFICATION', payload: notificationWithId.id });
      }, notificationWithId.duration);
    }
  }, []);

  const dismissNotification = useCallback((id: string) => {
    dispatch({ type: 'DISMISS_NOTIFICATION', payload: id });
  }, []);

  const clearNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  }, []);

  const value = {
    ...state,
    openMatchModal,
    closeMatchModal,
    openRatingModal,
    closeRatingModal,
    openFiltersSidebar,
    closeFiltersSidebar,
    toggleFiltersSidebar,
    openChatbot,
    closeChatbot,
    toggleChatbot,
    openTutorial,
    closeTutorial,
    openProfileEditModal,
    closeProfileEditModal,
    showNotification,
    dismissNotification,
    clearNotifications,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};
