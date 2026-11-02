const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing tickets and history...');
  await prisma.requestHistory.deleteMany();
  await prisma.serviceRequest.deleteMany();

  console.log('Ensuring default staff & admin accounts...');
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  const defaultUsers = [
    {
      name: 'Rajesh Sharma (Admin)',
      email: 'admin@aryaniwas.com',
      password: hashedPassword,
      role: 'Admin',
    },
    {
      name: 'Sunita Verma (Manager)',
      email: 'manager@aryaniwas.com',
      password: hashedPassword,
      role: 'Manager',
    },
    {
      name: 'Amit Kumar (Housekeeping)',
      email: 'amit@aryaniwas.com',
      password: hashedPassword,
      role: 'Staff',
    },
    {
      name: 'Vikram Singh (Maintenance)',
      email: 'vikram@aryaniwas.com',
      password: hashedPassword,
      role: 'Staff',
    },
  ];

  for (const u of defaultUsers) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      await prisma.user.create({ data: u });
    }
  }

  console.log('Seed executed: All tickets cleared, users preserved.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
