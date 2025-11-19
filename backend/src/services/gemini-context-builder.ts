/**
 * GeminiContextBuilder
 * Builds hybrid context for Gemini chat with movies and user preferences
 * Fase 3B.3 - Combines recommendations, semantic search, and user metadata
 */

import { prisma } from '../lib/prisma';
import { hybridRecommendationEngine } from './hybrid-recommendation-engine';
import { semanticSearchService } from './semantic-search.service';
import { userMetadataExtractor } from './user-metadata-extractor';
import {
  GeminiChatContextData,
  RecommendationResult,
  UserMetadataProfile,
  GeminiChatMessage
} from '../types/rag.types';

export class GeminiContextBuilder {
  private static instance: GeminiContextBuilder;

  private constructor() {}

  static getInstance(): GeminiContextBuilder {
    if (!GeminiContextBuilder.instance) {
      GeminiContextBuilder.instance = new GeminiContextBuilder();
    }
    return GeminiContextBuilder.instance;
  }

  /**
   * Build rich context for Gemini chat including recommendations and conversation history
   * Optimized with topK limits and conversation history pagination
   *
   * @param userId - User ID
   * @param userMessage - Current message from user
   * @param includeRecommendations - Whether to include hybrid recommendations
   * @param topK - Number of recommendations to include (capped at 20)
   * @param conversationId - ID of conversation for history retrieval
   * @returns Built context data for Gemini
   */
  async buildChatContext(
    userId: number,
    userMessage: string,
    includeRecommendations: boolean = true,
    topK: number = 5,
    conversationId?: string
  ): Promise<GeminiChatContextData> {
    try {
      // Limit topK to prevent excessive resource usage
      const MAX_TOP_K = 20;
      const MAX_HISTORY = 10; // Max conversation messages to include
      const normalizedTopK = Math.min(Math.max(topK, 1), MAX_TOP_K);

      console.log(`\n🔨 Building context for user ${userId}... (topK: ${normalizedTopK})`);

      // Step 1: Extract user metadata
      console.log('📊 Step 1: Extracting user metadata...');
      const userProfile = await userMetadataExtractor.extractUserMetadata(userId, 3);

      // Step 2: Get conversation history if conversationId provided (paginated)
      console.log(`📜 Step 2: Loading conversation history (max ${MAX_HISTORY} messages)...`);
      const conversationHistory = conversationId
        ? await this.getConversationHistory(conversationId, MAX_HISTORY)
        : [];

      // Step 3: Get recommendations if requested
      console.log('📍 Step 3: Getting hybrid recommendations...');
      let recommendations: RecommendationResult[] = [];
      let contextSource: 'hybrid' | 'vector' | 'metadata' | 'direct' = 'direct';

      if (includeRecommendations && userProfile.totalRatings > 0) {
        try {
          recommendations = await hybridRecommendationEngine.getRecommendations(
            userId,
            {
              topK: normalizedTopK,
              excludeRated: true,
              minUserRating: 3
            }
          );
          contextSource = 'hybrid';
          console.log(`✅ Got ${recommendations.length} recommendations`);
        } catch (error) {
          console.warn('⚠️  Failed to get hybrid recommendations, falling back to semantic search');

          // Fallback: Use semantic search based on user's favorite genres
          if (userProfile.favoriteGenres.length > 0) {
            const genreQuery = userProfile.favoriteGenres
              .slice(0, 2)
              .map(g => g.genre)
              .join(' ');

            const searchResults = await semanticSearchService.search(genreQuery, { topK: normalizedTopK });
            recommendations = searchResults.map(m => ({
              ...m,
              recommendationScore: m.similarityScore || 0
            }));
            contextSource = 'vector';
            console.log(`✅ Got ${recommendations.length} semantic search results`);
          }
        }
      }

      const context: GeminiChatContextData = {
        userMessage,
        userProfile: userProfile.totalRatings > 0 ? userProfile : undefined,
        recommendations: recommendations.length > 0 ? recommendations : undefined,
        conversationHistory: conversationHistory.length > 0 ? conversationHistory : undefined,
        contextSource
      };

      console.log(`✅ Context built successfully\n`);
      return context;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to build chat context: ${message}`);
      // Return minimal context to avoid breaking the chat
      return {
        userMessage,
        contextSource: 'direct'
      };
    }
  }

  /**
   * Format context for Gemini prompt injection
   * Creates a system message with user preferences and movie context
   *
   * @param context - Built context data
   * @returns Formatted system prompt
   */
  formatContextForGemini(context: GeminiChatContextData): string {
    let systemPrompt = 'You are a knowledgeable movie recommendation assistant. ';
    systemPrompt += 'Help users discover great films based on their preferences and provide analysis of movies, directors, actors, and genres.\n\n';

    // Add user profile context
    if (context.userProfile) {
      const topGenres = context.userProfile.favoriteGenres
        .slice(0, 3)
        .map(g => g.genre)
        .join(', ');

      systemPrompt += `## User Profile\n`;
      systemPrompt += `- Average Rating: ${context.userProfile.averageRating}/5\n`;
      systemPrompt += `- Total Ratings: ${context.userProfile.totalRatings}\n`;
      systemPrompt += `- Favorite Genres: ${topGenres}\n\n`;
    }

    // Add recommendations context
    if (context.recommendations && context.recommendations.length > 0) {
      systemPrompt += `## Recommended Movies for This User\n`;
      context.recommendations.slice(0, 3).forEach((movie, idx) => {
        systemPrompt += `${idx + 1}. "${movie.title}" (${movie.year}) - `;
        systemPrompt += `Genres: ${movie.genres.join(', ')} - `;
        systemPrompt += `Rating: ${movie.voteAverage ? parseFloat(movie.voteAverage.toString()).toFixed(1) : 'N/A'}\n`;
        if (movie.matchReason) {
          systemPrompt += `   Why: ${movie.matchReason}\n`;
        }
      });
      systemPrompt += '\n';
    }

    // Add conversation history context
    if (context.conversationHistory && context.conversationHistory.length > 0) {
      systemPrompt += `## Recent Conversation\n`;
      context.conversationHistory.forEach(msg => {
        const role = msg.role === 'user' ? 'User' : 'Assistant';
        systemPrompt += `${role}: ${msg.content}\n`;
      });
      systemPrompt += '\n';
    }

    systemPrompt += 'Provide helpful, detailed responses about movies and personalized recommendations when relevant.';

    return systemPrompt;
  }

  /**
   * Get conversation history from database with pagination
   * Limited to prevent excessive memory usage and processing
   *
   * @param conversationId - Conversation ID
   * @param limit - Number of recent messages to retrieve (default 10, capped at 20)
   * @returns Array of chat messages in chronological order
   */
  private async getConversationHistory(
    conversationId: string,
    limit: number = 10
  ): Promise<GeminiChatMessage[]> {
    try {
      // Cap at 20 messages to prevent context explosion
      const normalizedLimit = Math.min(Math.max(limit, 1), 20);

      const messages = await prisma.chatMessage.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        take: normalizedLimit
      });

      if (messages.length > 0) {
        console.log(`   - Retrieved ${messages.length} messages from conversation`);
      }

      return messages
        .reverse() // Return in chronological order
        .map(msg => ({
          role: (msg.role as 'user' | 'assistant') || 'user',
          content: msg.content
        }));
    } catch (error) {
      console.warn('⚠️  Failed to retrieve conversation history');
      return [];
    }
  }

  /**
   * Save chat message to database
   *
   * @param userId - User ID
   * @param conversationId - Conversation ID (can be generated if new)
   * @param role - Message role (user or assistant)
   * @param content - Message content
   * @param recommendedMovies - JSON string of recommended movies
   * @param contextSource - Where recommendations came from
   * @returns Saved chat message
   */
  async saveChatMessage(
    userId: number,
    conversationId: string,
    role: 'user' | 'assistant',
    content: string,
    recommendedMovies?: string,
    contextSource?: string
  ) {
    try {
      return await prisma.chatMessage.create({
        data: {
          userId,
          conversationId,
          role,
          content,
          recommendedMovies,
          contextSource
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to save chat message: ${message}`);
      throw new Error(`Failed to persist chat message: ${message}`);
    }
  }

  /**
   * Generate conversation ID for new conversations
   *
   * @returns Generated conversation ID
   */
  generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Extract movie mentions from user message
   * Simple extraction for keywords like "recommend", "like", etc.
   *
   * @param message - User message
   * @returns Array of detected intents
   */
  analyzeUserIntent(message: string): {
    isRecommendationRequest: boolean;
    isAnalysisRequest: boolean;
    isGeneralQuestion: boolean;
    keywords: string[];
  } {
    const lowerMessage = message.toLowerCase();

    const keywords = [
      ...new Set(
        lowerMessage
          .split(/\W+/)
          .filter(word => word.length > 3)
      )
    ].slice(0, 5);

    return {
      isRecommendationRequest: /recommend|suggest|similar|like|movies for/i.test(message),
      isAnalysisRequest: /analyze|explain|about|review|director|actor/i.test(message),
      isGeneralQuestion: !(/recommend|suggest|similar|like|analyze|explain|about|review|director|actor/i.test(message)),
      keywords
    };
  }
}

export const geminiContextBuilder = GeminiContextBuilder.getInstance();