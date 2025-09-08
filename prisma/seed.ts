import { PrismaClient, BlockType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const sampleImageUrl =
  "https://res.cloudinary.com/da4ragfbz/image/upload/v1757349741/profile_pics/xqtq80kdtmxf7mlvlvsd.png";

async function main() {
  console.log("Start seeding...");

  // Clean existing data
  console.log("Cleaning up existing data...");
  await prisma.contentBlock.deleteMany().catch(() => {});
  await prisma.post.deleteMany().catch(() => {});
  await prisma.user.deleteMany().catch(() => {});
  console.log("Cleaned up existing users, posts, and content blocks.");

  const adminEmail = "admin@blog.com";
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: "Admin User",
      password: hashedPassword,
      imageUrl: sampleImageUrl,
      bio: "This is the main administrator account for the blog.",
      hobbies: "Seeding, Databases, Blogging",
    },
  });
  console.log(`Created admin user: ${admin.name} (ID: ${admin.id})`);

  // Post + Block data
  const postsData = [
    {
      post: {
        title: "First Day on Campus: A Survival Guide",
        coverImageUrl:
          "https://placehold.co/600x400/A8D5E2/FFFFFF?text=Campus+View",
        published: true,
        authorId: admin.id,
      },
      blocks: [
        {
          order: 1,
          type: BlockType.HEADING_ONE,
          data: { text: "Welcome, Freshers!" },
        },
        {
          order: 2,
          type: BlockType.PARAGRAPH,
          data: {
            text: "Navigating your first day can be tough. Here are some tips to make it a breeze and start your semester right!",
          },
        },
        {
          order: 3,
          type: BlockType.IMAGE,
          data: {
            url: sampleImageUrl,
            caption: "A sample image from our gallery.",
          },
        },
        {
          order: 4,
          type: BlockType.PARAGRAPH,
          data: {
            text: "Remember to check your schedule, find your classrooms in advance, and don't be afraid to ask for directions. Everyone is here to help.",
          },
        },
      ],
    },
    {
      post: {
        title: "The Best Study Spots in the Library",
        coverImageUrl:
          "https://placehold.co/600x400/F9A826/FFFFFF?text=Library+Books",
        published: true,
        authorId: admin.id,
      },
      blocks: [
        {
          order: 1,
          type: BlockType.PARAGRAPH,
          data: {
            text: "Tired of the noisy dorm? Discover the hidden gems in the university library where you can actually get work done.",
          },
        },
        {
          order: 2,
          type: BlockType.HEADING_TWO,
          data: { text: "The Quiet Zone - Third Floor" },
        },
        {
          order: 3,
          type: BlockType.LIST_ITEM,
          data: { text: "Pros: Absolutely silent, individual desks." },
        },
        {
          order: 4,
          type: BlockType.LIST_ITEM,
          data: { text: "Cons: Fills up quickly during exam season." },
        },
      ],
    },
    {
      post: {
        title: "Joining a Club: My Experience (Draft)",
        published: false,
        authorId: admin.id,
      },
      blocks: [
        {
          order: 1,
          type: BlockType.PARAGRAPH,
          data: {
            text: "From the coding club to the hiking society, joining a student organization was the best decision I ever made. This post is currently a draft and should not be visible on the main page.",
          },
        },
        {
          order: 2,
          type: BlockType.IMAGE,
          data: { url: sampleImageUrl, caption: "Our team photo!" },
        },
      ],
    },
  ];

  // Create posts + blocks
  console.log("Creating sample posts...");
  for (const postData of postsData) {
    await prisma.post.create({
      data: {
        ...postData.post,
        blocks: {
          create: postData.blocks,
        },
      },
    });
  }
  console.log("Sample posts and their content blocks created.");

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error("An error occurred during seeding:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
