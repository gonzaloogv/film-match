import { pipeline } from '@xenova/transformers';
import type { FeatureExtractionPipeline } from '@xenova/transformers';

/**
 * EmbeddingService using Xenova/all-MiniLM-L6-v2
 * Local embedding generation without external API calls
 * Model: all-MiniLM-L6-v2 (384 dimensions)
 */
export class EmbeddingService {
  private static instance: EmbeddingService;
  private extractor: FeatureExtractionPipeline | null = null;
  private modelLoading: Promise<FeatureExtractionPipeline> | null = null;
  private isReady = false;

  private constructor() {}

  static getInstance(): EmbeddingService {
    if (!EmbeddingService.instance) {
      EmbeddingService.instance = new EmbeddingService();
    }
    return EmbeddingService.instance;
  }

  /**
   * Initialize the embedding model (lazy loading)
   * Called once on first use
   */
  async initialize(): Promise<void> {
    if (this.isReady) return;

    // Prevent multiple concurrent initialization attempts
    if (this.modelLoading) {
      await this.modelLoading;
      return;
    }

    console.log('🔄 Initializing embedding model (Xenova/all-MiniLM-L6-v2)...');

    this.modelLoading = (async () => {
      try {
        this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
          quantized: true // Use quantized version to save memory
        });
        this.isReady = true;
        console.log('✅ Embedding model loaded successfully');
        return this.extractor;
      } catch (error) {
        console.error('❌ Failed to load embedding model:', error);
        throw new Error(`Embedding model initialization failed: ${error}`);
      }
    })();

    await this.modelLoading;
  }

  /**
   * Generate embedding vector for a text string
   * @param text - The text to embed
   * @returns 384-dimensional vector as Float32Array
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.isReady) {
      await this.initialize();
    }

    if (!this.extractor) {
      throw new Error('Embedding model not initialized');
    }

    try {
      // Remove extra whitespace
      const cleanText = text.trim();

      if (!cleanText) {
        throw new Error('Cannot generate embedding for empty text');
      }

      // Generate embedding using the model
      const output = await this.extractor(cleanText, {
        pooling: 'mean',
        normalize: true
      });

      // Convert to regular array and return
      const embedding = Array.from(output.data);
      return embedding;
    } catch (error) {
      throw new Error(`Failed to generate embedding: ${error}`);
    }
  }

  /**
   * Generate embeddings for multiple texts (batch processing)
   * @param texts - Array of texts to embed
   * @returns Array of embedding vectors
   */
  async generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    if (!this.isReady) {
      await this.initialize();
    }

    if (!this.extractor) {
      throw new Error('Embedding model not initialized');
    }

    try {
      const embeddings: number[][] = [];

      // Process in batches to avoid memory issues
      const batchSize = 32; // Process 32 texts at a time
      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);

        // Filter empty texts
        const validBatch = batch.filter(t => t.trim().length > 0);

        if (validBatch.length === 0) {
          // Add zero vector for empty texts
          embeddings.push(...batch.map(() => new Array(384).fill(0)));
          continue;
        }

        // Generate embeddings for this batch
        for (const text of validBatch) {
          const embedding = await this.generateEmbedding(text);
          embeddings.push(embedding);
        }
      }

      return embeddings;
    } catch (error) {
      throw new Error(`Failed to generate batch embeddings: ${error}`);
    }
  }

  /**
   * Create a metadata string from movie data for embedding
   * Combines title, overview, genres, year for better semantic representation
   */
  static createMovieMetadata(movie: {
    title: string;
    overview?: string | null;
    releaseDate?: string | null;
    categoryNames?: string[];
  }): string {
    const parts = [movie.title];

    if (movie.overview) {
      parts.push(movie.overview);
    }

    if (movie.categoryNames && movie.categoryNames.length > 0) {
      parts.push(`Genres: ${movie.categoryNames.join(', ')}`);
    }

    if (movie.releaseDate) {
      const year = new Date(movie.releaseDate).getFullYear();
      if (!isNaN(year)) {
        parts.push(`Year: ${year}`);
      }
    }

    return parts.join(' | ');
  }

  /**
   * Verify model is loaded and ready
   */
  isModelReady(): boolean {
    return this.isReady;
  }

  /**
   * Get model information
   */
  getModelInfo() {
    return {
      model: 'Xenova/all-MiniLM-L6-v2',
      dimensions: 384,
      quantized: true,
      isReady: this.isReady,
      description: 'Lightweight sentence transformer, optimized for local inference'
    };
  }
}

export const embeddingService = EmbeddingService.getInstance();