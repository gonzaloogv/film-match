import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import movieRoutes from './routes/movie.routes';
import ratingRoutes from './routes/rating.routes';
import collectionRoutes from './routes/collection.routes';
import userRoutes from './routes/user.routes';
import categoryRoutes from './routes/category.routes';
import tmdbRoutes from './routes/tmdb.routes';
import ragRoutes from './routes/rag.routes';
import preferencesRoutes from './routes/preferences.routes';
import matchRoutes from './routes/match.routes';
import { errorHandler, notFound } from './middleware/error.middleware';
import { rateLimiters } from './middleware/rate-limiter';

const app = express();

// ============================================
// Security Middleware
// ============================================

// Helmet: Security headers
app.use(helmet());

// CORS: Allow cross-origin requests from frontend
app.use(cors({
  origin: env.frontendUrl,
  credentials: true
}));

// Compression: Reduce response size (60% bandwidth savings on average)
// gzip compression for responses > 1KB
app.use(compression({
  level: 6, // Balanced compression level (0-9, 6 is good default)
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress if client doesn't want compression
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Default filter (checks Content-Type and Content-Encoding)
    return compression.filter(req, res);
  }
}));
console.log('✅ Gzip compression enabled (threshold: 1KB)');

// Global rate limiting: Prevent abuse
app.use('/api/', rateLimiters.global);

// ============================================
// Body Parser
// ============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// Health Check
// ============================================
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv
  });
});

// ============================================
// API Routes with Custom Rate Limiting
// ============================================

// Auth routes: Strict rate limiting (prevent brute force)
app.use('/api/auth', rateLimiters.auth, authRoutes);

// RAG endpoints: Aggressive rate limiting (expensive operations)
app.use('/api/rag/chat', rateLimiters.chat); // Chat endpoint (5 per minute per user)
app.use('/api/rag/recommendations', rateLimiters.recommendations); // Recommendations (6 per minute per user)
app.use('/api/rag/search', rateLimiters.search); // Search (10 per minute)
app.use('/api/rag', ragRoutes);

// Standard API routes: Moderate rate limiting
app.use('/api/movies', rateLimiters.api, movieRoutes);
app.use('/api/ratings', rateLimiters.api, ratingRoutes);
app.use('/api/collections', rateLimiters.api, collectionRoutes);
app.use('/api/users', rateLimiters.api, userRoutes);
app.use('/api/preferences', rateLimiters.api, preferencesRoutes);
app.use('/api/categories', rateLimiters.api, categoryRoutes);
app.use('/api/tmdb', rateLimiters.api, tmdbRoutes);
app.use('/api/matches', rateLimiters.api, matchRoutes);

// ============================================
// Error Handling (MUST be last)
// ============================================
app.use(notFound);
app.use(errorHandler);

export default app;
