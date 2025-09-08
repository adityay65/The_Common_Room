import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

/**
 * Handles GET requests to /api/posts.
 * Fetches posts only for the currently authenticated user.
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Get the user ID from the request
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch posts authored by this user
    const posts = await prisma.post.findMany({
      where: {
        authorId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        coverImageUrl: true,
        published: true,
        author: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
        blocks: {
          where: { type: "PARAGRAPH" },
          orderBy: { order: "asc" },
          take: 1,
        },
      },
    });

    // 3. Format posts with preview
    const formattedPosts = posts.map((post) => {
      const firstParagraph = post.blocks[0]?.data as { text?: string };
      const previewContent =
        firstParagraph?.text?.substring(0, 150) +
          (firstParagraph?.text && firstParagraph.text.length > 150
            ? "..."
            : "") || "";

      return {
        id: post.id,
        title: post.title,
        createdAt: post.createdAt,
        coverImageUrl: post.coverImageUrl,
        published: post.published,
        previewContent,
        author: {
          name: post.author.name,
          image: post.author.imageUrl,
        },
      };
    });

    // 4. Return posts
    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error("Failed to fetch user posts:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
