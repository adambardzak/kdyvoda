/* eslint-disable */
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: process.env.POSTGRES_PRISMA_URL + '?pgbouncer=true&connection_limit=1&pool_timeout=0'
    }
  }
});

// Add error handling middleware
(prisma as any).$use(async (params: any, next: any) => {
  try {
    return await next(params);
  } catch (error: any) {
    if (error.code === '42P05') {
      // If we get a prepared statement error, retry the query
      console.log('Retrying query after prepared statement error');
      return await next(params);
    }
    throw error;
  }
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
