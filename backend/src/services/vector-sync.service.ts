import { prisma } from '../lib/prisma';
import { embeddingService, EmbeddingService } from './embedding.service';

export interface VectorSyncResult {
  totalProcessed: number;
  totalGenerated: number;
  totalFailed: number;
  errors: string[];
  duration: number;
}

/**
 * VectorSyncService
 * Orchestrates the process of generating embeddings for movies and storing them
 * Links local embeddings with Pinecone (in Phase 3B)
 */
export class VectorSyncService {
  private static instance: VectorSyncService;

  private constructor() {}

  static getInstance(): VectorSyncService {
    if (!VectorSyncService.instance) {
      VectorSyncService.instance = new VectorSyncService();
    }
    return VectorSyncService.instance;
  }

  /**
   * Generate embeddings for all movies with embeddingStatus = 'pending'
   * @param limit - Max number of movies to process (for incremental sync)
   */
  async generateEmbeddingsForMovies(limit: number = 100): Promise<VectorSyncResult> {
    const startTime = Date.now();
    let totalProcessed = 0;
    let totalGenerated = 0;
    let totalFailed = 0;
    const errors: string[] = [];

    try {
      // Initialize embedding model
      console.log('🔄 Initializing embedding model...');
      await embeddingService.initialize();

      // Fetch movies pending embedding
      console.log(`📍 Fetching up to ${limit} movies with pending embeddings...`);
      const moviesToProcess = await prisma.movie.findMany({
        where: { embeddingStatus: 'pending' },
        include: { categories: { include: { category: true } } },
        take: limit
      });

      console.log(`📊 Found ${moviesToProcess.length} movies to process\n`);

      if (moviesToProcess.length === 0) {
        return {
          totalProcessed: 0,
          totalGenerated: 0,
          totalFailed: 0,
          errors: [],
          duration: 0
        };
      }

      // Process each movie
      for (let i = 0; i < moviesToProcess.length; i++) {
        const movie = moviesToProcess[i];
        totalProcessed++;

        try {
          // Create metadata string for embedding
          const categoryNames = movie.categories.map(mc => mc.category.name);
          const metadata = EmbeddingService.createMovieMetadata({
            title: movie.title,
            overview: movie.overview,
            releaseDate: movie.releaseDate ? movie.releaseDate.toISOString().split('T')[0] : null,
            categoryNames
          });

          // Generate embedding
          const embedding = await embeddingService.generateEmbedding(metadata);

          // Store embedding status in Movie and create MovieEmbedding record
          await prisma.movie.update({
            where: { id: movie.id },
            data: {
              embeddingStatus: 'completed'
            }
          });

          // Store the actual embedding vector in MovieEmbedding
          // Using movie.id as vectorId temporarily (will be updated with Pinecone ID later)
          await prisma.movieEmbedding.upsert({
            where: { movieId: movie.id },
            update: {
              vectorId: JSON.stringify(embedding) // Store embedding as JSON
            },
            create: {
              movieId: movie.id,
              vectorId: JSON.stringify(embedding) // Store embedding as JSON
            }
          });

          totalGenerated++;

          // Log progress every 10 movies
          if (totalProcessed % 10 === 0) {
            const progress = ((totalProcessed / moviesToProcess.length) * 100).toFixed(1);
            console.log(
              `[${totalProcessed}/${moviesToProcess.length}] (${progress}%) - Generated: ${totalGenerated}, Failed: ${totalFailed}`
            );
          }
        } catch (error) {
          totalFailed++;
          const message = error instanceof Error ? error.message : String(error);
          errors.push(`Movie ${movie.id} (${movie.title}): ${message}`);

          // Mark as failed in database
          await prisma.movie.update({
            where: { id: movie.id },
            data: {
              embeddingStatus: 'failed'
            }
          });

          console.error(`❌ Failed to embed movie ${movie.id}: ${message}`);
        }

        // Add small delay to avoid overwhelming memory
        if (totalProcessed % 20 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      const duration = Date.now() - startTime;

      console.log('\n' + '='.repeat(60));
      console.log('📊 EMBEDDING GENERATION COMPLETE');
      console.log('='.repeat(60));
      console.log(`   Total Processed: ${totalProcessed}`);
      console.log(`   Total Generated: ${totalGenerated}`);
      console.log(`   Total Failed:    ${totalFailed}`);
      console.log(`   Duration:        ${(duration / 1000 / 60).toFixed(2)} minutes`);

      return {
        totalProcessed,
        totalGenerated,
        totalFailed,
        errors,
        duration
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('❌ Embedding generation failed:', message);
      throw new Error(`Vector sync failed: ${message}`);
    }
  }

  /**
   * Check embedding status for a specific movie
   */
  async getMovieEmbeddingStatus(movieId: number) {
    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
      select: {
        id: true,
        title: true,
        embeddingStatus: true
      }
    });

    return movie;
  }

  /**
   * Get statistics on embedding progress
   */
  async getEmbeddingStats() {
    const [pending, completed, failed] = await Promise.all([
      prisma.movie.count({ where: { embeddingStatus: 'pending' } }),
      prisma.movie.count({ where: { embeddingStatus: 'completed' } }),
      prisma.movie.count({ where: { embeddingStatus: 'failed' } })
    ]);

    const total = pending + completed + failed;

    return {
      total,
      pending,
      completed,
      failed,
      completionPercentage: total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0',
      model: {
        name: 'Xenova/all-MiniLM-L6-v2',
        dimensions: 384
      }
    };
  }

  /**
   * Retry failed embeddings
   */
  async retryFailedEmbeddings(limit: number = 50): Promise<VectorSyncResult> {
    console.log(`🔄 Retrying up to ${limit} failed embeddings...\n`);

    const failedMovies = await prisma.movie.updateMany({
      where: { embeddingStatus: 'failed' },
      data: { embeddingStatus: 'pending' }
    });

    console.log(`Found ${failedMovies.count} failed movies, retrying...`);

    return this.generateEmbeddingsForMovies(limit);
  }
}

export const vectorSyncService = VectorSyncService.getInstance();