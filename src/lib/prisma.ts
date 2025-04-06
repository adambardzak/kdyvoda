/* eslint-disable */
import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [
      {
        emit: 'stdout',
        level: 'error',
      },
      {
        emit: 'stdout',
        level: 'warn',
      },
    ],
    datasources: {
      db: {
        url: process.env.POSTGRES_PRISMA_URL,
      },
    },
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

let prisma: ReturnType<typeof prismaClientSingleton>;

if (process.env.NODE_ENV === 'production') {
  prisma = prismaClientSingleton();
} else {
  if (!global.prisma) {
    global.prisma = prismaClientSingleton();
  }
  prisma = global.prisma;
}

export default prisma;
