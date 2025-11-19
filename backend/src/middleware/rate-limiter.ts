/**
 * Rate Limiter Middleware
 * Express middleware for enforcing rate limits per endpoint
 * Uses express-rate-limit with custom key generation and handling
 */

import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { RateLimitConfig } from '../config/rate-limits';

/**
 * Create a rate limiter middleware with custom configuration
 */
export function createRateLimiter(config: RateLimitConfig) {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: config.message,
    standardHeaders: config.standardHeaders,
    skipSuccessfulRequests: config.skipSuccessfulRequests,
    skipFailedRequests: config.skipFailedRequests,
    keyGenerator: config.keyGenerator || ((req, res) => {
      // Use ipKeyGenerator to extract IP, wrapping it with proper types
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      return ipKeyGenerator(ip);
    }),
    handler: (req, res) => {
      console.warn(`⚠️  Rate limit exceeded: ${config.message}`);
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: config.message
        }
      });
    }
  });
}

/**
 * Pre-configured rate limiters for different endpoints
 */
export const rateLimiters = {
  /**
   * Global rate limiter
   * Applied to all endpoints unless overridden
   */
  global: createRateLimiter({
    windowMs: 60 * 1000,
    max: 100,
    message: '❌ Too many requests from this IP, please try again later.',
    standardHeaders: true,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  }),

  /**
   * Auth endpoints - strict limiting
   * Prevents brute force attacks on login/register
   */
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: '❌ Too many login attempts, please try again in 15 minutes.',
    standardHeaders: true,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  }),

  /**
   * Chat endpoint - aggressive limiting
   * Chat is expensive (Gemini API calls)
   * Rate limit by userId if available, otherwise by IP
   */
  chat: createRateLimiter({
    windowMs: 60 * 1000,
    max: 5,
    message: '❌ Chat rate limit exceeded (5 per minute). Please wait before sending another message.',
    standardHeaders: true,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (req) => {
      const userId = req.body?.userId || req.user?.id;
      if (userId) {
        console.log(`🔒 Rate limiting chat for user ${userId}`);
        return `chat_user_${userId}`;
      }
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      console.log(`🔒 Rate limiting chat for IP ${ip}`);
      return `chat_ip_${ipKeyGenerator(ip)}`;
    }
  }),

  /**
   * Recommendations endpoint - moderate limiting
   * Semantic search + recommendations are moderately expensive
   * Rate limit by userId if available, otherwise by IP
   */
  recommendations: createRateLimiter({
    windowMs: 60 * 1000,
    max: 6,
    message: '❌ Recommendations rate limit exceeded (6 per minute). Please wait before requesting again.',
    standardHeaders: true,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (req) => {
      const userId = req.query?.userId || req.user?.id;
      if (userId) {
        console.log(`🔒 Rate limiting recommendations for user ${userId}`);
        return `recommendations_user_${userId}`;
      }
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      console.log(`🔒 Rate limiting recommendations for IP ${ip}`);
      return `recommendations_ip_${ipKeyGenerator(ip)}`;
    }
  }),

  /**
   * Search endpoint - moderate limiting
   * Semantic search is CPU/memory intensive
   */
  search: createRateLimiter({
    windowMs: 60 * 1000,
    max: 10,
    message: '❌ Search rate limit exceeded (10 per minute). Please wait before searching again.',
    standardHeaders: true,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  }),

  /**
   * Generic API endpoints - standard limiting
   * Used for standard CRUD operations
   */
  api: createRateLimiter({
    windowMs: 60 * 1000,
    max: 30,
    message: '❌ API rate limit exceeded. Please wait before making more requests.',
    standardHeaders: true,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  })
};

/**
 * Create a custom rate limiter for specific requirements
 * Useful for one-off rate limit configurations
 */
export function createCustomRateLimiter(
  windowMs: number,
  max: number,
  message: string,
  keyGenerator?: (req: any) => string
) {
  return createRateLimiter({
    windowMs,
    max,
    message,
    standardHeaders: true,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator
  });
}
