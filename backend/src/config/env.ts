import { config } from 'dotenv';

// Cargar variables de entorno
config();

interface EnvConfig {
  // Database
  databaseUrl: string;

  // Server
  port: number;
  nodeEnv: string;

  // JWT
  jwtSecret: string;
  jwtExpiresIn: string;

  // Google OAuth
  googleAuthEnabled: boolean;
  googleClientId: string;
  googleClientSecret: string;
  googleRedirectUri: string;

  // Frontend
  frontendUrl: string;

  // TMDB API
  tmdbApiKey: string;
  tmdbBaseUrl: string;
  tmdbImageBaseUrl: string;

  // Pinecone (Vector Database)
  pineconeApiKey?: string;
  pineconeEnvironment?: string;
  pineconeIndexName?: string;

  // Gemini API (RAG)
  geminiApiKey?: string;
}

/**
 * Valida que existan las variables de entorno requeridas
 * @throws Error si falta alguna variable requerida
 */
function validateEnv(): EnvConfig {
  // Determinar si Google OAuth está habilitado
  const googleAuthEnabled = process.env.GOOGLE_AUTH_ENABLED !== 'false';

  // Variables siempre requeridas
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'FRONTEND_URL',
    'TMDB_API_KEY'
  ];

  // Google OAuth: solo requeridas si está habilitado
  if (googleAuthEnabled) {
    requiredVars.push('GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI');
  }

  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file'
    );
  }

  // Log del estado de Google OAuth
  if (googleAuthEnabled) {
    console.log('✅ Google OAuth enabled');
  } else {
    console.log('⚠️  Google OAuth disabled (set GOOGLE_AUTH_ENABLED=true to enable)');
  }

  return {
    databaseUrl: process.env.DATABASE_URL!,
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    googleAuthEnabled,
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || '',
    frontendUrl: process.env.FRONTEND_URL!,
    tmdbApiKey: process.env.TMDB_API_KEY!,
    tmdbBaseUrl: process.env.TMDB_API_BASE_URL || 'https://api.themoviedb.org/3',
    tmdbImageBaseUrl: process.env.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p',
    pineconeApiKey: process.env.PINECONE_API_KEY,
    pineconeEnvironment: process.env.PINECONE_ENVIRONMENT || 'us-east-1',
    pineconeIndexName: process.env.PINECONE_INDEX_NAME || 'film-match',
    geminiApiKey: process.env.GEMINI_API_KEY
  };
}

export const env = validateEnv();