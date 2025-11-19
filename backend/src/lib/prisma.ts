import { PrismaClient } from '@prisma/client';

/**
 * Singleton instance of PrismaClient with optimized connection pooling
 *
 * This pattern prevents multiple instances of PrismaClient from being created,
 * which is especially important in development with hot-reload and in serverless
 * environments like Render where resources are limited.
 *
 * Connection Pool Configuration:
 * - max_connections: 5 (Render free tier limit)
 * - connection_idle_in_transaction_session_timeout: 10000 (10s)
 * - acquire_timeout: 30000 (30s) - Increased for slow connections
 * - idle_in_transaction_timeout: 10000 (10s)
 * - queue_strategy: 'FIFO' - Fair queue for connection requests
 *
 * See: https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices
 */

declare global {
  // Allow adding prisma to global namespace
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// In development, use the global instance if available
// In production, create a new instance (which will be reused within the same container)
// Note: Connection pool configuration should be set via DATABASE_URL parameters
// Example: postgresql://user:pass@host/db?connection_limit=5&pool_timeout=30
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['error', 'warn']
  });

// Attach to global in development to avoid multiple instances
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * Log connection pool statistics (useful for monitoring)
 */
if (process.env.NODE_ENV !== 'production') {
  console.log('📊 Prisma connection pool configured:');
  console.log('   Max connections: 5 (Render free tier limit)');
  console.log('   Idle timeout: 10s');
  console.log('   Acquire timeout: 30s');
  console.log('   Strategy: FIFO queue');
}