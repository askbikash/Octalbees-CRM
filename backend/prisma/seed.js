const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@octalbees.com';
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (existingAdmin) {
    console.log('Admin user already exists.');
    return;
  }

  const password_hash = await bcrypt.hash('Admin@123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: adminEmail,
      password_hash,
      role: 'ADMIN',
      phone: '9999999999'
    }
  });

  console.log('Created default admin user:');
  console.log(`Email: ${admin.email}`);
  console.log(`Password: Admin@123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
