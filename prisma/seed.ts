import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Clean up previous data to make the script re-runnable
  await prisma.post.deleteMany({}).catch(() => {});
  await prisma.user.deleteMany({}).catch(() => {});
  console.log('Cleaned up existing users and posts.');

  const adminEmail = 'admin@college.com';
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create a single admin user
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: 'Admin User',
      password: hashedPassword,
    },
  });
  console.log(`Created admin user: ${admin.name} (ID: ${admin.id})`);

  // Create sample posts linked to the admin user
  await prisma.post.createMany({
    data: [
      {
        title: 'First Day on Campus: A Survival Guide',
        content: 'Navigating your first day can be tough. Here are some tips to make it a breeze and start your semester right! This is the full content of the post, which is longer than the excerpt.',
        imageUrl: 'https://placehold.co/600x400/A8D5E2/FFFFFF?text=Campus+View',
        published: true,
        authorId: admin.id,
      },
      {
        title: 'The Best Study Spots in the Library',
        content: 'Tired of the noisy dorm? Discover the hidden gems in the university library where you can actually get work done. This is the full content of the post.',
        imageUrl: 'https://placehold.co/600x400/F9A826/FFFFFF?text=Library+Books',
        published: true,
        authorId: admin.id,
      },
      {
        title: 'Joining a Club: My Experience (Draft)',
        content: 'From the coding club to the hiking society, joining a student organization was the best decision I ever made. This post is currently a draft and should not be visible on the main page.',
        published: false,
        authorId: admin.id,
      },
    ],
  });
  console.log('Sample posts created.');
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

