/* eslint-disable */
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// Create a new PrismaClient instance for each request
const createPrismaClient = (): PrismaClient => {
  return new PrismaClient({
    log: ['query', 'error', 'warn'],
    datasources: {
      db: {
        url: process.env.POSTGRES_PRISMA_URL
      }
    },
    // Add connection pooling configuration
    __internal: {
      engine: {
        connectionLimit: 10,
        poolTimeout: 10,
        connectionTimeout: 10,
      },
    },
  });
};

// Initialize prisma for development
if (process.env.NODE_ENV !== 'production') {
  global.prisma = createPrismaClient();
}

// Export a function that creates a new client for each request
export default function getPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === 'production') {
    const client = createPrismaClient();
    // Ensure we disconnect after each request
    client.$on('beforeExit', async () => {
      await client.$disconnect();
    });
    return client;
  }
  return global.prisma!;
}
