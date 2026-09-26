const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@octalbees.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin_default_pass';
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (existingAdmin) {
    console.log('Admin user already exists.');
    return;
  }

  const password_hash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: adminEmail,
      password_hash,
      role: 'ADMIN',
      phone: '9999999999',
      security_question: process.env.ADMIN_SECURITY_QUESTION || 'What is your company name?',
      security_answer: process.env.ADMIN_SECURITY_ANSWER || 'octalbees'
    }
  });

  console.log('Created default admin user:');
  console.log(`Email: ${admin.email}`);
  console.log(`Note: Password is set from ADMIN_PASSWORD environment variable or default.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
