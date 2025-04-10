/* eslint-disable */
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: process.env.POSTGRES_PRISMA_URL
    }
  }
});

// Add middleware to handle prepared statements
(prisma as any).$use(async (params: any, next: any) => {
  // Add a unique identifier to each query to prevent prepared statement conflicts
  const queryId = Math.random().toString(36).substring(7);
  params.args = {
    ...params.args,
    queryId
  };
  
  try {
    return await next(params);
  } catch (error: any) {
    if (error.code === '42P05') {
      // If we get a prepared statement error, create a new client instance and retry
      console.log('Retrying query with new client instance after prepared statement error');
      const newClient = new PrismaClient({
        log: ['query', 'error', 'warn'],
        datasources: {
          db: {
            url: process.env.POSTGRES_PRISMA_URL
          }
        }
      });
      try {
        // Use the model and action from the original params
        const model = params.model;
        const action = params.action;
        const result = await (newClient as any)[model][action](params.args);
        await newClient.$disconnect();
        return result;
      } catch (retryError) {
        await newClient.$disconnect();
        throw retryError;
      }
    }
    throw error;
  }
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
