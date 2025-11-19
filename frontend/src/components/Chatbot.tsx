import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { useRAGChat } from '@/hooks/api/useRAGChat';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  movies?: Array<{
    id: number;
    title: string;
    releaseYear?: number;
    genres?: string[];
  }>;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola! Soy tu asistente de recomendaciones de Film-Match. Pregúntame sobre películas, pídeme recomendaciones o cuéntame qué tipo de películas te gustan.',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    sendMessage,
    isChattingLoading,
    chatResponse,
    chatError,
  } = useRAGChat();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle chat response
  useEffect(() => {
    if (chatResponse) {
      const botMessage: Message = {
        id: chatResponse.id || Date.now().toString(),
        text: chatResponse.assistantMessage,
        sender: 'bot',
        timestamp: new Date(),
        movies: chatResponse.recommendedMovies?.map((m: any) => ({
          id: m.id,
          title: m.title,
          releaseYear: m.releaseYear,
          genres: m.genres,
        })),
      };
      setMessages((prev) => [...prev, botMessage]);

      // Update conversation ID for continuity
      if (chatResponse.conversationId) {
        setConversationId(chatResponse.conversationId);
      }
    }
  }, [chatResponse]);

  // Handle errors
  useEffect(() => {
    if (chatError) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  }, [chatError]);

  const handleSend = () => {
    if (inputValue.trim() === '' || isChattingLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Send to RAG service
    try {
      sendMessage(inputValue, conversationId, 5);
    } catch (error) {
      console.error('Error sending message:', error);
    }

    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-2xl z-40"
          >
            <MessageCircle className="w-8 h-8 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 h-[70vh] sm:h-[500px] max-h-[600px] bg-dark-card rounded-2xl shadow-2xl z-40 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Asistente Film-Match</h3>
                  <p className="text-xs text-gray-400">
                    {isChattingLoading ? 'Escribiendo...' : 'Siempre disponible'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-dark-input flex items-center justify-center hover:bg-opacity-80 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-gradient-primary text-white'
                        : 'bg-dark-input text-gray-100'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>

                    {/* Show recommended movies if present */}
                    {message.movies && message.movies.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <p className="text-xs text-gray-400 mb-2">Películas mencionadas:</p>
                        <div className="space-y-1">
                          {message.movies.slice(0, 3).map((movie) => (
                            <div
                              key={movie.id}
                              className="text-xs bg-dark-bg px-2 py-1 rounded"
                            >
                              {movie.title}
                              {movie.releaseYear && ` (${movie.releaseYear})`}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Loading indicator */}
              {isChattingLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-dark-input text-gray-100 px-4 py-2 rounded-2xl">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje..."
                  disabled={isChattingLoading}
                  className="flex-1 bg-dark-input text-white px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-primary-pink transition-all placeholder-gray-500 text-sm disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={isChattingLoading || !inputValue.trim()}
                  className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isChattingLoading ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
