import { Pinecone } from '@pinecone-database/pinecone';

export interface PineconeConfig {
  apiKey: string;
  indexName: string;
}

export interface VectorRecord {
  id: string;
  values: number[]; // 384 dimensions for all-MiniLM-L6-v2
  metadata: Record<string, any>;
}

export interface SearchResult {
  movieId: string;
  title: string;
  score: number;
  metadata: Record<string, any>;
}

/**
 * PineconeService
 * Manages vector database operations in Pinecone
 * Handles: upserting vectors, searching, deleting
 */
export class PineconeService {
  private client: Pinecone | null = null;
  private indexName: string;
  private isInitialized = false;

  constructor(config: PineconeConfig) {
    if (!config.apiKey) {
      throw new Error('Pinecone API key is required');
    }
    this.indexName = config.indexName;

    // Initialize Pinecone client
    this.client = new Pinecone({
      apiKey: config.apiKey
    });
  }

  /**
   * Initialize and verify index connection
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log(`🔄 Initializing Pinecone connection to index '${this.indexName}'...`);

      if (!this.client) {
        throw new Error('Pinecone client not initialized');
      }

      // Get index stats to verify connection
      const index = this.client.Index(this.indexName);
      const stats = await index.describeIndexStats();

      console.log(`✅ Connected to Pinecone index '${this.indexName}'`);
      console.log(`   Namespaces: ${Object.keys(stats.namespaces || {}).length}`);
      console.log(`   Vector count: ${(stats as any).totalRecordCount || 0}`);

      this.isInitialized = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to initialize Pinecone: ${message}`);
      throw new Error(`Pinecone initialization failed: ${message}`);
    }
  }

  /**
   * Upsert a single vector record
   */
  async upsertVector(record: VectorRecord): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const index = this.client!.Index(this.indexName);

      // Validate vector dimensions
      if (record.values.length !== 384) {
        throw new Error(
          `Invalid vector dimensions: expected 384, got ${record.values.length}`
        );
      }

      await index.upsert([
        {
          id: record.id,
          values: record.values,
          metadata: record.metadata as any
        }
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to upsert vector: ${message}`);
    }
  }

  /**
   * Upsert multiple vectors in batch
   */
  async upsertVectors(records: VectorRecord[], batchSize: number = 100): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const index = this.client!.Index(this.indexName);

      // Process in batches
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);

        // Convert to Pinecone format
        const vectors = batch.map(record => ({
          id: record.id,
          values: record.values,
          metadata: record.metadata as any
        }));

        await index.upsert(vectors as any);

        if (records.length > batchSize) {
          const progress = ((i + batchSize) / records.length * 100).toFixed(1);
          console.log(`   Uploaded ${i + batchSize}/${records.length} vectors (${progress}%)`);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to upsert vectors batch: ${message}`);
    }
  }

  /**
   * Search for similar vectors
   */
  async search(
    queryVector: number[],
    topK: number = 10,
    filterMetadata?: Record<string, any>
  ): Promise<SearchResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (queryVector.length !== 384) {
        throw new Error(
          `Invalid query vector dimensions: expected 384, got ${queryVector.length}`
        );
      }

      const index = this.client!.Index(this.indexName);

      const results = await index.query({
        vector: queryVector,
        topK,
        includeMetadata: true,
        filter: filterMetadata
      });

      return results.matches.map(match => ({
        movieId: match.metadata?.['movieId'] as string,
        title: match.metadata?.['title'] as string,
        score: match.score || 0,
        metadata: match.metadata || {}
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Search failed: ${message}`);
    }
  }

  /**
   * Delete a vector by ID
   */
  async deleteVector(vectorId: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const index = this.client!.Index(this.indexName);
      await index.deleteOne(vectorId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to delete vector: ${message}`);
    }
  }

  /**
   * Delete multiple vectors
   */
  async deleteVectors(vectorIds: string[]): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const index = this.client!.Index(this.indexName);
      await index.deleteMany(vectorIds);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to delete vectors: ${message}`);
    }
  }

  /**
   * Get index statistics
   */
  async getStats() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const index = this.client!.Index(this.indexName);
      const stats = await index.describeIndexStats();
      return stats;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get index stats: ${message}`);
    }
  }

  /**
   * Check if service is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}