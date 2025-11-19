import { vectorSyncService } from '../src/services/vector-sync.service';
import { initializePineconeService } from '../src/config/pinecone.config';
import { embeddingService } from '../src/services/embedding.service';
import { prisma } from '../src/lib/prisma';

/**
 * Script to generate embeddings for all movies and upload to Pinecone
 * This should be run AFTER sync-8k-movies.ts
 */
async function generateAndUploadEmbeddings() {
  const startTime = Date.now();

  try {
    console.log('🚀 Starting Embedding Generation & Pinecone Upload\n');

    // Step 1: Generate embeddings locally
    console.log('📍 Step 1: Generating embeddings for all movies...\n');
    const embeddingResult = await vectorSyncService.generateEmbeddingsForMovies(500);

    console.log(`\n✅ Embeddings Generated:`);
    console.log(`   Total Generated: ${embeddingResult.totalGenerated}`);
    console.log(`   Total Failed: ${embeddingResult.totalFailed}`);

    if (embeddingResult.totalGenerated === 0) {
      console.log('\n⚠️  No embeddings were generated. Check if movies exist in database.\n');
      await prisma.$disconnect();
      return;
    }

    // Step 2: Initialize Pinecone
    console.log('\n📍 Step 2: Initializing Pinecone connection...');
    const pineconeService = await initializePineconeService();

    // Step 3: Upload embeddings to Pinecone
    console.log('\n📍 Step 3: Uploading embeddings to Pinecone...\n');

    const moviesToUpload = await prisma.movie.findMany({
      where: { embeddingStatus: 'completed' },
      include: {
        categories: { include: { category: true } },
        embeddings: true
      }
    });

    console.log(`📊 Found ${moviesToUpload.length} movies with embeddings to upload\n`);

    const records = moviesToUpload.map(movie => {
      // Get embedding from MovieEmbedding relation
      const movieEmbedding = movie.embeddings[0];
      const embedding = movieEmbedding?.vectorId ? JSON.parse(movieEmbedding.vectorId) : [];
      const genres = movie.categories.map(mc => mc.category.slug);

      return {
        id: movie.id, // Use database ID as Pinecone ID
        values: embedding,
        metadata: {
          movieId: movie.id,
          title: movie.title,
          year: movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : undefined,
          genres,
          overview: movie.overview?.substring(0, 500), // Limit overview length for metadata
          posterPath: movie.posterPath,
          tmdbId: movie.tmdbId,
          voteAverage: movie.voteAverage?.toString()
        }
      };
    });

    // Upload to Pinecone in batches
    console.log(`📤 Uploading ${records.length} vectors to Pinecone (batch size: 100)...`);
    await pineconeService.upsertVectors(records, 100);

    // Step 4: Verify upload
    console.log('\n📍 Step 4: Verifying Pinecone upload...');
    const stats = await pineconeService.getStats();
    console.log(`\n✅ Pinecone Stats:`);
    console.log(`   Index: ${stats.dimension ? `${stats.dimension} dimensions` : 'N/A'}`);
    console.log(`   Total Vectors: ${stats.totalVectorCount || 0}`);

    // Step 5: Summary
    const duration = Date.now() - startTime;
    const durationMinutes = (duration / 1000 / 60).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log('✨ EMBEDDING GENERATION & UPLOAD COMPLETE');
    console.log('='.repeat(60));
    console.log(`\n   Embeddings Generated: ${embeddingResult.totalGenerated}`);
    console.log(`   Vectors Uploaded: ${records.length}`);
    console.log(`   Failed: ${embeddingResult.totalFailed}`);
    console.log(`   Duration: ${durationMinutes} minutes\n`);

    console.log('🎉 Ready for semantic search and RAG!\n');

    await prisma.$disconnect();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('\n❌ Embedding generation/upload failed:', message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

generateAndUploadEmbeddings();
