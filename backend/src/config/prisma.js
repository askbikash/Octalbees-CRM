const { PrismaClient } = require('@prisma/client');

// Single shared PrismaClient instance to avoid exhausting DB connection pool
const prisma = new PrismaClient();

module.exports = prisma;
