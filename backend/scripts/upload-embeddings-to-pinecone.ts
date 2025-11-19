import { initializePineconeService } from '../src/config/pinecone.config';
import { prisma } from '../src/lib/prisma';

/**
 * Script to upload existing embeddings to Pinecone
 * This script reads embeddings from the database and uploads them to Pinecone
 */
async function uploadEmbeddingsToPinecone() {
  const startTime = Date.now();

  try {
    console.log('🚀 Starting Pinecone Upload\n');

    // Step 1: Initialize Pinecone
    console.log('📍 Step 1: Initializing Pinecone connection...\n');
    const pineconeService = await initializePineconeService();

    // Step 2: Fetch embeddings from database
    console.log('📍 Step 2: Fetching embeddings from database...\n');

    const moviesToUpload = await prisma.movie.findMany({
      where: { embeddingStatus: 'completed' },
      include: {
        categories: { include: { category: true } },
        embeddings: true
      }
    });

    console.log(`📊 Found ${moviesToUpload.length} movies with embeddings to upload\n`);

    if (moviesToUpload.length === 0) {
      console.log('⚠️  No embeddings found. Generate them first using generate-embeddings.ts\n');
      await prisma.$disconnect();
      return;
    }

    // Step 3: Prepare vectors
    console.log('📍 Step 3: Preparing vectors for upload...');

    const records = moviesToUpload.map(movie => {
      // Get embedding from MovieEmbedding relation
      const movieEmbedding = movie.embeddings[0];
      const embedding = movieEmbedding?.vectorId ? JSON.parse(movieEmbedding.vectorId) : [];
      const genres = movie.categories.map(mc => mc.category.slug);

      if (embedding.length !== 384) {
        console.warn(
          `⚠️  Invalid embedding dimension for movie ${movie.id} (${movie.title}): ${embedding.length}`
        );
      }

      return {
        id: movie.id.toString(), // Use database ID as Pinecone ID
        values: embedding,
        metadata: {
          movieId: movie.id.toString(),
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

    const validRecords = records.filter(r => r.values.length === 384);
    console.log(`   Valid vectors: ${validRecords.length}/${records.length}\n`);

    // Step 4: Upload to Pinecone in batches
    console.log('📍 Step 4: Uploading vectors to Pinecone...\n');
    console.log(`📤 Uploading ${validRecords.length} vectors (batch size: 100)...\n`);

    await pineconeService.upsertVectors(validRecords, 100);

    // Step 5: Verify upload
    console.log('\n📍 Step 5: Verifying Pinecone upload...');
    const stats = await pineconeService.getStats();
    console.log(`\n✅ Pinecone Stats:`);
    console.log(`   Index Name: ${stats.indexFullyQualifiedName || 'film-match'}`);
    console.log(`   Dimension: ${stats.dimension || 384}`);
    console.log(`   Total Vectors: ${stats.totalVectorCount || 0}`);
    console.log(`   Namespaces: ${Object.keys(stats.namespaces || {}).length}`);

    // Step 6: Summary
    const duration = Date.now() - startTime;
    const durationMinutes = (duration / 1000 / 60).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log('✨ PINECONE UPLOAD COMPLETE');
    console.log('='.repeat(60));
    console.log(`\n   Vectors Uploaded: ${validRecords.length}`);
    console.log(`   Duration: ${durationMinutes} minutes`);
    console.log('\n🎉 Ready for semantic search and RAG!\n');

    await prisma.$disconnect();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('\n❌ Pinecone upload failed:', message);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    await prisma.$disconnect();
    process.exit(1);
  }
}

uploadEmbeddingsToPinecone();
