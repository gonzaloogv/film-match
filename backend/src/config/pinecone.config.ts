import { env } from './env';
import { PineconeService } from '../services/pinecone.service';

/**
 * Pinecone Configuration
 * Centralized config for vector database
 */

export const pineconeConfig = {
  apiKey: env.pineconeApiKey,
  indexName: env.pineconeIndexName || 'film-match'
};

/**
 * Validate Pinecone configuration
 */
export function validatePineconeConfig(): void {
  if (!pineconeConfig.apiKey) {
    throw new Error('PINECONE_API_KEY is required in environment variables');
  }
  if (!pineconeConfig.indexName) {
    throw new Error('PINECONE_INDEX_NAME is required in environment variables');
  }
}

/**
 * Initialize Pinecone service singleton
 */
let pineconeServiceInstance: PineconeService | null = null;

export async function initializePineconeService(): Promise<PineconeService> {
  if (pineconeServiceInstance) {
    return pineconeServiceInstance;
  }

  validatePineconeConfig();

  pineconeServiceInstance = new PineconeService({
    apiKey: pineconeConfig.apiKey || '',
    indexName: pineconeConfig.indexName
  });

  await pineconeServiceInstance.initialize();
  return pineconeServiceInstance;
}

export function getPineconeService(): PineconeService {
  if (!pineconeServiceInstance) {
    throw new Error('Pinecone service not initialized. Call initializePineconeService() first.');
  }
  return pineconeServiceInstance;
}
