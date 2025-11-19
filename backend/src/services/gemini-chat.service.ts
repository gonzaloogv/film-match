/**
 * GeminiChatService
 * Main chat service for Gemini AI integration
 * Handles chat requests, context building, and response generation
 * Fase 3B.3 - Gemini Integration
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { geminiContextBuilder } from './gemini-context-builder';
import {
  GeminiChatRequest,
  GeminiChatResponseData,
  GeminiChatMessage
} from '../types/rag.types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export class GeminiChatService {
  private static instance: GeminiChatService;
  private client: GoogleGenerativeAI;
  private model = 'gemini-2.5-flash'; // Using latest Gemini 2.5 Flash model
  private conversationSessions: Map<string, any> = new Map(); // In-memory sessions for active conversations

  private constructor() {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key') {
      console.warn('⚠️  GEMINI_API_KEY not configured. Chat will be disabled.');
      this.client = null as any;
    } else {
      this.client = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
  }

  static getInstance(): GeminiChatService {
    if (!GeminiChatService.instance) {
      GeminiChatService.instance = new GeminiChatService();
    }
    return GeminiChatService.instance;
  }

  /**
   * Check if Gemini service is properly configured
   */
  isConfigured(): boolean {
    return !!this.client && GEMINI_API_KEY !== 'your-gemini-api-key';
  }

  /**
   * Send message and get response from Gemini with hybrid context
   *
   * @param request - Chat request with user message and options
   * @returns Chat response with Gemini's answer and metadata
   */
  async chat(request: GeminiChatRequest): Promise<GeminiChatResponseData> {
    if (!this.isConfigured()) {
      throw new Error(
        'Gemini API is not configured. Please set GEMINI_API_KEY in .env file. ' +
        'Get your free API key from: https://aistudio.google.com/app/apikey'
      );
    }

    const startTime = Date.now();

    try {
      console.log(`\n🤖 Gemini Chat for User ${request.userId}`);
      console.log(`   Message: "${request.message.substring(0, 50)}..."`);

      // Generate conversation ID if not provided
      const conversationId = request.conversationId || geminiContextBuilder.generateConversationId();
      console.log(`   Conversation: ${conversationId}`);

      // Step 1: Build hybrid context
      console.log('📦 Building hybrid context...');
      const context = await geminiContextBuilder.buildChatContext(
        request.userId,
        request.message,
        request.includeRecommendations !== false, // Default true
        request.topK || 5,
        conversationId
      );

      // Step 2: Format context for Gemini
      const systemPrompt = geminiContextBuilder.formatContextForGemini(context);

      // Step 3: Prepare messages
      const messages: GeminiChatMessage[] = [];

      // Add conversation history if available
      if (context.conversationHistory && context.conversationHistory.length > 0) {
        messages.push(...context.conversationHistory);
      }

      // Add current message
      messages.push({
        role: 'user',
        content: request.message
      });

      console.log(`   Context source: ${context.contextSource}`);
      console.log(`   Messages: ${messages.length} (including history)`);

      // Step 4: Call Gemini API
      console.log('🔄 Calling Gemini API...');
      const model = this.client.getGenerativeModel({
        model: this.model,
        systemInstruction: systemPrompt
      });

      const chat = model.startChat({
        history: messages
          .slice(0, -1) // All except the last (current) message
          .map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
          }))
      });

      // Send the current message
      const result = await chat.sendMessage(request.message);
      const response = result.response;
      const assistantMessage = response.text();

      console.log(`✅ Response received (${assistantMessage.length} chars)`);

      // Step 5: Extract movies mentioned in context for response
      const recommendedMovieIds = context.recommendations
        ? context.recommendations.map(r => r.id)
        : [];

      // Step 6: Save to database
      console.log('💾 Saving conversation...');
      const userChatMsg = await geminiContextBuilder.saveChatMessage(
        request.userId,
        conversationId,
        'user',
        request.message,
        undefined,
        context.contextSource
      );

      const recommendedMoviesJson = context.recommendations
        ? JSON.stringify(context.recommendations.map(m => ({
          id: m.id,
          title: m.title,
          score: m.recommendationScore
        })))
        : undefined;

      const assistantChatMsg = await geminiContextBuilder.saveChatMessage(
        request.userId,
        conversationId,
        'assistant',
        assistantMessage,
        recommendedMoviesJson,
        context.contextSource
      );

      const duration = Date.now() - startTime;

      // Step 7: Build response
      const chatResponse: GeminiChatResponseData = {
        id: assistantChatMsg.id.toString(),
        conversationId,
        userMessage: request.message,
        assistantMessage,
        tokensUsed: 0, // Gemini Pro doesn't expose token count in this SDK version
        recommendedMovies: context.recommendations ? context.recommendations : undefined,
        contextSource: context.contextSource,
        timestamp: new Date().toISOString()
      };

      console.log(`✅ Chat complete in ${duration}ms\n`);
      return chatResponse;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Chat failed: ${message}`);

      // Check for specific API errors
      if (message.includes('API_KEY_INVALID')) {
        throw new Error('Invalid Gemini API key. Please check your GEMINI_API_KEY in .env');
      } else if (message.includes('BLOCKED')) {
        throw new Error('Request blocked by Gemini safety filters. Please rephrase your message.');
      } else if (message.includes('429')) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      throw new Error(`Chat service error: ${message}`);
    }
  }

  /**
   * Continue an existing conversation
   * Uses conversation history for context
   *
   * @param conversationId - ID of conversation to continue
   * @param userId - User ID
   * @param message - New message from user
   * @returns Chat response
   */
  async continueConversation(
    conversationId: string,
    userId: number,
    message: string
  ): Promise<GeminiChatResponseData> {
    return this.chat({
      userId,
      message,
      conversationId,
      includeRecommendations: true,
      topK: 3 // Fewer recommendations for follow-up messages
    });
  }

  /**
   * Analyze user intent and determine if they need recommendations or general chat
   *
   * @param message - User message
   * @returns Intent analysis
   */
  analyzeIntent(message: string) {
    return geminiContextBuilder.analyzeUserIntent(message);
  }

  /**
   * Clear session cache (useful for testing or memory management)
   */
  clearSessions(): void {
    this.conversationSessions.clear();
    console.log('✅ Session cache cleared');
  }

  /**
   * Get configuration status
   */
  getStatus(): {
    configured: boolean;
    model: string;
    apiKeyPresent: boolean;
  } {
    return {
      configured: this.isConfigured(),
      model: this.model,
      apiKeyPresent: !!GEMINI_API_KEY && GEMINI_API_KEY !== 'your-gemini-api-key'
    };
  }

  /**
   * Fallback chat when Gemini is not available
   * Uses recommendation engine to provide movie suggestions with template responses
   *
   * @param request - Chat request
   * @returns Fallback response with recommendations
   */
  async fallbackChat(request: GeminiChatRequest): Promise<GeminiChatResponseData> {
    const startTime = Date.now();

    try {
      console.log(`\n🤖 Fallback Chat for User ${request.userId}`);
      console.log(`   Message: "${request.message.substring(0, 50)}..."`);

      const conversationId = request.conversationId || geminiContextBuilder.generateConversationId();

      // Build context with recommendations
      const context = await geminiContextBuilder.buildChatContext(
        request.userId,
        request.message,
        true,
        request.topK || 5,
        conversationId
      );

      // Analyze intent to customize response
      const intent = this.analyzeIntent(request.message);

      // Generate fallback response based on intent and recommendations
      let assistantMessage: string;

      if (context.recommendations && context.recommendations.length > 0) {
        const movieList = context.recommendations
          .slice(0, 5)
          .map((m, i) => `${i + 1}. **${m.title}** (${m.year || 'N/A'}) - ${m.genres?.join(', ') || 'N/A'}`)
          .join('\n');

        if (intent.isRecommendationRequest) {
          assistantMessage = `¡Aquí tienes algunas recomendaciones basadas en tus gustos!\n\n${movieList}\n\n` +
            `Estas películas fueron seleccionadas considerando tu historial de valoraciones. ` +
            `¿Te gustaría más detalles sobre alguna de ellas?`;
        } else if (intent.isAnalysisRequest) {
          assistantMessage = `Encontré estas películas que podrían interesarte:\n\n${movieList}\n\n` +
            `¿Hay algún género específico que te gustaría explorar más?`;
        } else {
          assistantMessage = `Basándome en tu historial, estas películas podrían gustarte:\n\n${movieList}\n\n` +
            `El servicio de chat avanzado no está disponible temporalmente, pero puedo seguir recomendándote películas.`;
        }
      } else {
        assistantMessage = `Lo siento, no pude encontrar recomendaciones específicas para ti en este momento. ` +
          `Te sugiero explorar las categorías populares o calificar algunas películas para mejorar tus recomendaciones.\n\n` +
          `El servicio de chat avanzado no está disponible temporalmente.`;
      }

      // Save conversation to database
      await geminiContextBuilder.saveChatMessage(
        request.userId,
        conversationId,
        'user',
        request.message,
        undefined,
        'fallback'
      );

      const recommendedMoviesJson = context.recommendations
        ? JSON.stringify(context.recommendations.map(m => ({
            id: m.id,
            title: m.title,
            score: m.recommendationScore
          })))
        : undefined;

      const assistantChatMsg = await geminiContextBuilder.saveChatMessage(
        request.userId,
        conversationId,
        'assistant',
        assistantMessage,
        recommendedMoviesJson,
        'fallback'
      );

      const duration = Date.now() - startTime;

      const response: GeminiChatResponseData = {
        id: assistantChatMsg.id.toString(),
        conversationId,
        userMessage: request.message,
        assistantMessage,
        tokensUsed: 0,
        recommendedMovies: context.recommendations,
        contextSource: 'fallback' as any,
        timestamp: new Date().toISOString()
      };

      console.log(`✅ Fallback chat complete in ${duration}ms\n`);
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Fallback chat failed: ${message}`);
      throw new Error(`Fallback chat error: ${message}`);
    }
  }
}

export const geminiChatService = GeminiChatService.getInstance();