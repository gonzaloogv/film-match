import app from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';
import { initializePineconeService } from './config/pinecone.config';

const PORT = env.port;

async function startServer() {
  try {
    // Verificar conexión a BD
    await prisma.$connect();
    console.log('✅ Database connected');

    // Inicializar Pinecone (Fase 3B)
    try {
      await initializePineconeService();
      console.log('✅ Pinecone connected');
    } catch (error) {
      console.warn('⚠️  Pinecone initialization skipped (may need API key):', error instanceof Error ? error.message : String(error));
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${env.nodeEnv}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Manejo de shutdown graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
