import React, { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Chatbot from '../components/Chatbot';
import InfoButton from '../components/InfoButton';
import MovieListContainer from '../presentation/hooks/MovieListContainer';
import { SwipeTutorial } from '../presentation/components/SwipeTutorial';
import { useUI } from '../context/ui';

const TUTORIAL_SEEN_KEY = 'film-match-tutorial-seen';

/**
 * Home Page
 * Wrapper component that displays the main movie discovery interface
 * Uses the refactored MovieListContainer with clean architecture hooks
 */
const Home: React.FC = () => {
  const { tutorialOpen, openTutorial, closeTutorial } = useUI();

  // Mostrar tutorial en primera visita
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem(TUTORIAL_SEEN_KEY);

    if (!hasSeenTutorial) {
      // Pequeño delay para que la animación se vea mejor
      const timer = setTimeout(() => {
        openTutorial();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [openTutorial]);

  const handleCloseTutorial = () => {
    localStorage.setItem(TUTORIAL_SEEN_KEY, 'true');
    closeTutorial();
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <MovieListContainer />
      <Chatbot />
      <InfoButton />

      {/* Tutorial Modal */}
      <AnimatePresence>
        {tutorialOpen && <SwipeTutorial onClose={handleCloseTutorial} />}
      </AnimatePresence>
    </div>
  );
};

export default Home;
