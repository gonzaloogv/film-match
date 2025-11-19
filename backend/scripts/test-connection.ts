import { prisma } from '../src/lib/prisma';

/**
 * Test script to validate Prisma connection and basic operations
 * Run with: npm run test:connection
 */

async function main() {
  try {
    console.log('🔌 Testing Prisma connection...');

    // Test 1: Simple query to check connection
    const userCount = await prisma.user.count();
    console.log(`✅ Connection successful!`);
    console.log(`   Users in database: ${userCount}`);

    // Test 2: Check tables exist
    const movieCount = await prisma.movie.count();
    console.log(`✅ Movie table accessible`);
    console.log(`   Movies in database: ${movieCount}`);

    const categoryCount = await prisma.category.count();
    console.log(`✅ Category table accessible`);
    console.log(`   Categories in database: ${categoryCount}`);

    // Test 3: Check if we can create a test user
    console.log('\n📝 Creating test user...');
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        passwordHash: 'test-hash',
      },
    });
    console.log(`✅ User created successfully!`);
    console.log(`   ID: ${testUser.id}`);
    console.log(`   Email: ${testUser.email}`);

    // Test 4: Delete test user
    await prisma.user.delete({
      where: { id: testUser.id },
    });
    console.log(`✅ Test user cleaned up`);

    console.log('\n🎉 All tests passed! Prisma is working correctly.');
  } catch (error) {
    console.error('❌ Error testing connection:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();