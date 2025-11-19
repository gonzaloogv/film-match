import { tmdbSyncService } from '../src/services/tmdb-sync.service';
import { prisma } from '../src/lib/prisma';

/**
 * Script to synchronize 200 movies from TMDB (initial batch)
 * Strategy: Sync from popular movies + a few top categories
 * Later we can add more movies incrementally
 */
async function syncMovies() {
  const startTime = Date.now();
  let totalMovies = 0;
  const results = [];

  try {
    console.log('🎬 Starting 200 Movies Sync from TMDB (Initial Batch)\n');

    // Categories to sync (covering major genres - subset for 200 movies)
    const categoriesToSync = [
      'action',
      'drama',
      'comedy',
      'horror',
      'sci-fi'
    ];

    // Step 1: Sync popular movies (highest priority)
    console.log('📍 Phase 1: Syncing Popular Movies (3 pages)');
    const popularResult = await tmdbSyncService.syncPopularMovies({ maxPages: 3 });
    results.push(popularResult);
    totalMovies += popularResult.totalSaved;
    console.log(
      `   ✅ Saved: ${popularResult.totalSaved}, Total: ${totalMovies}\n`
    );

    // Step 2: Sync by top categories
    console.log(`📍 Phase 2: Syncing ${categoriesToSync.length} Categories`);
    console.log('   (2 pages per category to reach ~200 movies)\n');

    const pagesPerCategory = 2; // 2 pages = ~40 movies per category

    for (let i = 0; i < categoriesToSync.length; i++) {
      const category = categoriesToSync[i];
      console.log(
        `   [${i + 1}/${categoriesToSync.length}] Syncing '${category}'...`
      );

      const categoryResult = await tmdbSyncService.syncByCategory(category, {
        maxPages: pagesPerCategory
      });

      results.push(categoryResult);
      totalMovies += categoryResult.totalSaved;

      // Log progress
      const percentage = ((i + 1) / categoriesToSync.length) * 100;
      console.log(
        `       ✅ Saved: ${categoryResult.totalSaved} | Running Total: ${totalMovies} (${percentage.toFixed(1)}%)\n`
      );

      // Small delay between categories to avoid overload
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Step 4: Summary
    const duration = Date.now() - startTime;
    const durationMinutes = (duration / 1000 / 60).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log('📊 SYNCHRONIZATION COMPLETE');
    console.log('='.repeat(60));

    const totalProcessed = results.reduce((sum, r) => sum + r.totalProcessed, 0);
    const totalSaved = results.reduce((sum, r) => sum + r.totalSaved, 0);
    const totalSkipped = results.reduce((sum, r) => sum + r.totalSkipped, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

    console.log(`\n   Total Processed: ${totalProcessed}`);
    console.log(`   Total Saved:     ${totalSaved}`);
    console.log(`   Total Skipped:   ${totalSkipped}`);
    console.log(`   Total Errors:    ${totalErrors}`);
    console.log(`   Duration:        ${durationMinutes} minutes`);

    // Database stats
    const dbMovieCount = await prisma.movie.count();
    const dbCategoryCount = await prisma.category.count();
    console.log(`\n   Database Movies:    ${dbMovieCount}`);
    console.log(`   Database Categories: ${dbCategoryCount}`);

    // Storage estimation
    const avgBytesPerMovie = 500; // rough estimate
    const estimatedMB = (dbMovieCount * avgBytesPerMovie) / 1024 / 1024;
    console.log(`\n   Est. Storage Used:  ${estimatedMB.toFixed(2)} MB / 1024 MB`);
    console.log(`   Capacity Remaining: ${(1024 - estimatedMB).toFixed(2)} MB`);

    console.log('\n✨ Sync completed successfully!\n');

    await prisma.$disconnect();
  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

syncMovies();