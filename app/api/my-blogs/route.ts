import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth'; // Re-using your auth helper

export async function GET(request: NextRequest) {
  try {
    // 1. Get the user ID from the token
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch posts where the authorId matches the user's ID
    const userPosts = await prisma.post.findMany({
      where: {
        authorId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: { name: true }, // Continue including author name
        },
      },
    });

    // 3. Return the posts
    return NextResponse.json(userPosts);

  } catch (error) {
    console.error('Failed to fetch user posts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
