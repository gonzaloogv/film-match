/**
 * Rate Limiting Configuration
 * Defines rate limits per endpoint to prevent abuse and manage server load
 * Critical for resource-constrained Render free tier
 */

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  message: string; // Response message when limit exceeded
  standardHeaders: boolean; // Return rate limit info in headers
  skipSuccessfulRequests: boolean; // Only count failed requests
  skipFailedRequests: boolean; // Only count successful requests
  keyGenerator?: (req: any) => string; // Custom key generator
}

/**
 * Global rate limit configuration
 * Base limit applied to all endpoints not covered by specific rules
 */
export const globalRateLimit: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  message: '❌ Too many requests from this IP, please try again later.',
  standardHeaders: true,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
};

/**
 * Auth endpoints rate limits
 * Stricter limits to prevent brute force attacks
 */
export const authRateLimit: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes per IP
  message: '❌ Too many login attempts, please try again in 15 minutes.',
  standardHeaders: true,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
};

/**
 * Chat endpoint rate limit
 * Aggressive limit - chat is expensive (Gemini API calls)
 * Expected usage: 1-2 messages per minute per user
 */
export const chatRateLimit: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 messages per minute per user
  message: '❌ Chat rate limit exceeded (5 per minute). Please wait before sending another message.',
  standardHeaders: true,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  keyGenerator: (req) => {
    // Rate limit by userId if provided, otherwise by IP
    const userId = req.body?.userId || req.user?.id;
    return userId ? `chat_user_${userId}` : `chat_ip_${req.ip}`;
  }
};

/**
 * Recommendations endpoint rate limit
 * Moderate limit - semantic search + recommendations are moderately expensive
 * Expected usage: 2-3 recommendations per minute per user
 */
export const recommendationsRateLimit: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 6, // 6 requests per minute per user
  message: '❌ Recommendations rate limit exceeded (6 per minute). Please wait before requesting again.',
  standardHeaders: true,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  keyGenerator: (req) => {
    // Rate limit by userId if provided
    const userId = req.query?.userId || req.user?.id;
    return userId ? `recommendations_user_${userId}` : `recommendations_ip_${req.ip}`;
  }
};

/**
 * Semantic search endpoint rate limit
 * Moderate limit - semantic search is CPU/memory intensive
 * Expected usage: 3-5 searches per minute per user
 */
export const searchRateLimit: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 searches per minute per IP
  message: '❌ Search rate limit exceeded (10 per minute). Please wait before searching again.',
  standardHeaders: true,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
};

/**
 * API endpoints rate limit (generic)
 * Moderate limit for standard API operations
 */
export const apiRateLimit: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per IP
  message: '❌ API rate limit exceeded. Please wait before making more requests.',
  standardHeaders: true,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
};

/**
 * Rate limit presets for different environments
 */
export const rateLimitsByEnvironment = {
  development: {
    global: { ...globalRateLimit, max: 1000 },
    auth: { ...authRateLimit, max: 50 },
    chat: { ...chatRateLimit, max: 50 },
    recommendations: { ...recommendationsRateLimit, max: 100 },
    search: { ...searchRateLimit, max: 100 },
    api: { ...apiRateLimit, max: 300 }
  },
  production: {
    global: globalRateLimit,
    auth: authRateLimit,
    chat: chatRateLimit,
    recommendations: recommendationsRateLimit,
    search: searchRateLimit,
    api: apiRateLimit
  }
};

/**
 * Get rate limit config for current environment
 */
export function getRateLimitConfig(endpoint: keyof typeof rateLimitsByEnvironment.production): RateLimitConfig {
  const env = (process.env.NODE_ENV || 'development') as keyof typeof rateLimitsByEnvironment;
  const limits = rateLimitsByEnvironment[env] || rateLimitsByEnvironment.development;
  return limits[endpoint];
}

/**
 * Rate limit statistics for monitoring
 */
export interface RateLimitStats {
  endpoint: string;
  totalRequests: number;
  blockedRequests: number;
  blockRate: string;
}
