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

// Disable prepared statements
(prisma as any).$use(async (params: any, next: any) => {
  if (params.action === 'query') {
    params.args = {
      ...params.args,
      preparedStatement: false
    };
  }
  return next(params);
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
