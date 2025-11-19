/**
 * Setup Test User Script
 * Creates a test user "natali" with preferences and rates some drama movies
 * Run with: npx tsx scripts/setup-test-user.ts
 */

import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function setupTestUser() {
  try {
    console.log('🚀 Starting test user setup...\n');

    // Step 1: Create user "natali"
    console.log('📝 Step 1: Creating user "natali"...');
    const hashedPassword = await bcrypt.hash('sitiosweb', 10);

    const user = await prisma.user.create({
      data: {
        email: 'natali.bogarin@gmail.com',
        username: 'natali',
        passwordHash: hashedPassword,
        profilePicture: null
      }
    });
    console.log(`✅ User created: ID ${user.id}\n`);

    // Step 2: Get or create Drama category
    console.log('📝 Step 2: Setting up categories...');
    let dramaCat = await prisma.category.findUnique({
      where: { slug: 'drama' }
    });

    if (!dramaCat) {
      dramaCat = await prisma.category.create({
        data: {
          name: 'Drama',
          slug: 'drama'
        }
      });
    }
    console.log(`✅ Drama category ready: ${dramaCat.name}\n`);

    // Step 3: Create some drama movies
    console.log('📝 Step 3: Creating drama movies...');

    const moviesData = [
      {
        title: 'Fight Club',
        tmdbId: 550,
        overview: 'An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more.',
        releaseDate: new Date('1999-10-15'),
        voteAverage: 8.8,
        posterPath: '/6ZQKjlV1x3UNM9vtJHmHkB2EV9h.jpg',
        genres: ['Drama', 'Thriller']
      },
      {
        title: 'The Shawshank Redemption',
        tmdbId: 278,
        overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        releaseDate: new Date('1994-09-23'),
        voteAverage: 9.3,
        posterPath: '/q6725aR8Zs4IwGMoMZbiNjnutsE.jpg',
        genres: ['Drama']
      },
      {
        title: 'The Godfather',
        tmdbId: 238,
        overview: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant youngest son.',
        releaseDate: new Date('1972-03-24'),
        voteAverage: 9.2,
        posterPath: '/3bhkrj58Vtu7enYsRolD1fmneco.jpg',
        genres: ['Drama', 'Crime']
      },
      {
        title: 'Pulp Fiction',
        tmdbId: 680,
        overview: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
        releaseDate: new Date('1994-10-14'),
        voteAverage: 8.9,
        posterPath: '/d5iIlW_sdue48llNdjCnucJ9mCh.jpg',
        genres: ['Drama', 'Crime']
      },
      {
        title: 'Inception',
        tmdbId: 27205,
        overview: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.',
        releaseDate: new Date('2010-07-16'),
        voteAverage: 8.8,
        posterPath: '/9gk7adHYeDMwWoC1SSUJh4UGUB5.jpg',
        genres: ['Drama', 'Sci-Fi', 'Thriller']
      },
      {
        title: 'The Cat in the Hat',
        tmdbId: 8466,
        overview: 'A quirky, high-spirited cat comes to the aid of two bored children.',
        releaseDate: new Date('2003-11-21'),
        voteAverage: 5.3,
        posterPath: '/path/to/poster.jpg',
        genres: ['Comedy', 'Family']
      },
      {
        title: 'Breakfast at Tiffany\'s',
        tmdbId: 1726,
        overview: 'A young woman moves to New York and takes on a romantic life that revolves around her apartment.',
        releaseDate: new Date('1961-10-18'),
        voteAverage: 7.8,
        posterPath: '/path/to/poster.jpg',
        genres: ['Drama', 'Romance']
      }
    ];

    const movies = [];
    for (const movieData of moviesData) {
      let movie = await prisma.movie.findUnique({
        where: { tmdbId: movieData.tmdbId }
      });

      if (!movie) {
        movie = await prisma.movie.create({
          data: {
            tmdbId: movieData.tmdbId,
            title: movieData.title,
            overview: movieData.overview,
            releaseDate: movieData.releaseDate,
            voteAverage: movieData.voteAverage,
            posterPath: movieData.posterPath,
            embeddingStatus: 'pending'
          }
        });
      }
      movies.push(movie);
    }
    console.log(`✅ Created ${movies.length} movies\n`);

    // Step 4: Assign Drama genre to drama movies
    console.log('📝 Step 4: Assigning genres to movies...');
    const dramaMovies = movies.slice(0, 5); // First 5 are drama

    for (const movie of dramaMovies) {
      const exists = await prisma.movieCategory.findUnique({
        where: {
          movieId_categoryId: {
            movieId: movie.id,
            categoryId: dramaCat.id
          }
        }
      });

      if (!exists) {
        await prisma.movieCategory.create({
          data: {
            movieId: movie.id,
            categoryId: dramaCat.id
          }
        });
      }
    }
    console.log(`✅ Drama genre assigned\n`);

    // Step 5: User rates drama movies
    console.log('📝 Step 5: Adding user ratings for drama movies...');
    const ratings = [
      { movieId: movies[0].id, rating: 10, review: 'Masterpiece! One of the best movies ever.' }, // Fight Club
      { movieId: movies[1].id, rating: 10, review: 'Perfect cinema.' }, // Shawshank
      { movieId: movies[2].id, rating: 9, review: 'Epic and engaging.' }, // Godfather
      { movieId: movies[3].id, rating: 9, review: 'Brilliantly written and directed.' }, // Pulp Fiction
      { movieId: movies[4].id, rating: 8, review: 'Mind-bending and creative.' }, // Inception
      { movieId: movies[6].id, rating: 7, review: 'Classic romance.' }, // Breakfast at Tiffany's
    ];

    for (const ratingData of ratings) {
      const exists = await prisma.userRating.findUnique({
        where: {
          userId_movieId: {
            userId: user.id,
            movieId: ratingData.movieId
          }
        }
      });

      if (!exists) {
        await prisma.userRating.create({
          data: {
            userId: user.id,
            movieId: ratingData.movieId,
            rating: ratingData.rating,
            review: ratingData.review
          }
        });
      }
    }
    console.log(`✅ ${ratings.length} ratings created\n`);

    // Step 6: Display user info
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ TEST USER SETUP COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 User Details:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: sitiosweb`);
    console.log('\n🎬 User Preferences:');
    console.log(`   Favorite Genre: Drama`);
    console.log(`   Favorite Actor: Brad Pitt`);
    console.log(`   Favorite Director: Tarantino`);
    console.log(`   Favorite Movie: Fight Club`);
    console.log(`\n⭐ Ratings:`);
    console.log(`   Fight Club: 10/10`);
    console.log(`   The Shawshank Redemption: 10/10`);
    console.log(`   The Godfather: 9/10`);
    console.log(`   Pulp Fiction: 9/10`);
    console.log(`   Inception: 8/10`);
    console.log(`   Breakfast at Tiffany's: 7/10`);
    console.log('\n💬 Test Chat Message:');
    console.log(`   "Quiero una pelicula donde haya gatos"`);
    console.log('\n🔗 API Request:');
    console.log(`   POST /api/rag/chat`);
    console.log(`   Body: {`);
    console.log(`     "userId": ${user.id},`);
    console.log(`     "message": "Quiero una pelicula donde haya gatos",`);
    console.log(`     "includeRecommendations": true,`);
    console.log(`     "topK": 3`);
    console.log(`   }`);
    console.log('\n');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

setupTestUser();