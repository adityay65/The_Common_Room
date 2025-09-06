import { PrismaClient } from '@prisma/client';

// This setup prevents creating too many Prisma Client instances in a serverless environment
// during development (hot-reloading).

// Add prisma to the NodeJS global type
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;

