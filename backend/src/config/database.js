const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn'], // Temporarily disabled 'query' to see actual errors
});

module.exports = prisma;