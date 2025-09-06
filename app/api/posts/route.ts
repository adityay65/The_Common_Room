// app/api/posts/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Make sure the path to your prisma client is correct

/**
 * A helper function to generate initials from a name.
 */
function getInitials(name: string): string {
  const names = name.split(' ');
  const initials = names.map(n => n[0]).join('');
  return initials.slice(0, 2).toUpperCase();
}

export async function GET() {
  try {
    // 1. Fetch posts using Prisma, including the related author data
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: 'desc', // Get the newest posts first
      },
      include: {
        author: true, // This assumes a relation named 'author' in your schema
      },
    });

    // 2. Map the data to the format your components expect
    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      imageUrl: post.imageUrl,
      createdAt: post.createdAt.toISOString(),
      author: post.author.name, 
      // Generate initials from the author's name
      authorImage: post.author.name ? getInitials(post.author.name) : '', 
    }));

    return NextResponse.json(formattedPosts);

  } catch (error) {
    console.error("Failed to fetch posts:", error);
    // Return a 500 Internal Server Error response
    return NextResponse.json(
      { error: "Unable to fetch posts." },
      { status: 500 }
    );
  }
}