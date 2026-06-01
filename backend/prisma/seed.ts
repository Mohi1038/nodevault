// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Delete existing records to avoid duplicate conflicts during manual seeds
  await prisma.secret.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create ADMIN user
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@nodevault.com',
      password: adminPasswordHash,
      role: 'ADMIN',
    },
  });
  console.log(`👤 Created Admin Account: ${adminUser.email}`);

  // 2. Create USER user
  const userPasswordHash = await bcrypt.hash('user123', 10);
  const regularUser = await prisma.user.create({
    data: {
      email: 'user@nodevault.com',
      password: userPasswordHash,
      role: 'USER',
    },
  });
  console.log(`👤 Created Regular User Account: ${regularUser.email}`);

  // 3. Create initial secret notes for user
  const secrets = [
    {
      title: 'Personal Gmail Password',
      type: 'PASSWORD',
      content: 'super-gmail-secret-password-9988',
      userId: regularUser.id,
    },
    {
      title: 'WiFi Router Access Keys',
      type: 'KEY',
      content: 'WPA2-PSK: router-secret-pass-key',
      userId: regularUser.id,
    },
    {
      title: 'Dev Server Todo Notes',
      type: 'NOTE',
      content: 'Todo: Implement token rotation on production clusters. Remember to disable debugging logs.',
      userId: regularUser.id,
    },
  ];

  for (const s of secrets) {
    const createdSecret = await prisma.secret.create({ data: s });
    console.log(`🔑 Seeded Secret Item: "${createdSecret.title}" for user: ${regularUser.email}`);
  }

  // 4. Create a secret for admin too
  const adminSecret = await prisma.secret.create({
    data: {
      title: 'Production Infrastructure Keys',
      type: 'KEY',
      content: 'AWS-ACCESS-KEY: admin-infra-keys-prod',
      userId: adminUser.id,
    },
  });
  console.log(`🔑 Seeded Secret Item: "${adminSecret.title}" for admin: ${adminUser.email}`);

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
