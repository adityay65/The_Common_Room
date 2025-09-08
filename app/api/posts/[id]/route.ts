import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth'; // Your helper

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // 👈 params must be awaited
) {
  try {
    // 1. Authenticate the user
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Await params
    const { id } = await context.params;
    const postId = parseInt(id, 10);

    // 3. Find the post
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // 4. Authorize
    if (post.authorId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 5. Delete
    await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Failed to delete post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
