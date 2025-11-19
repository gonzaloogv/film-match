import { prisma } from './src/lib/prisma';

async function checkMovieSync() {
  try {
    const movieCount = await prisma.movie.count();
    const categoryCount = await prisma.category.count();

    console.log(`\n📊 DATABASE STATUS:`);
    console.log(`   Movies synchronized: ${movieCount}`);
    console.log(`   Categories available: ${categoryCount}`);

    if (movieCount > 0) {
      const sample = await prisma.movie.findFirst({
        include: { categories: { include: { category: true } } }
      });
      console.log(`\n📝 Sample movie:`);
      console.log(`   Title: ${sample?.title}`);
      console.log(`   TMDB ID: ${sample?.tmdbId}`);
      console.log(`   Year: ${sample?.releaseDate}`);
      if (sample?.categories && sample.categories.length > 0) {
        const catNames = sample.categories.map(c => c.category.name).join(', ');
        console.log(`   Categories: ${catNames}`);
      }
    } else {
      console.log(`\n⚠️  No movies synchronized yet. Need to run sync.`);
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error checking database:', error);
    process.exit(1);
  }
}

checkMovieSync();
