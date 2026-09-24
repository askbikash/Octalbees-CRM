const app = require('./app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`✅ Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
