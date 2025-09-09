// app/api/posts/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Make sure the path to your prisma client is correct
/**
 * A helper function to generate initials from a name.
 */
function getInitials(name: string): string {
  if (!name) return "";
  const names = name.split(" ");
  const initials = names.map((n) => n[0]).join("");
  return initials.slice(0, 2).toUpperCase();
}

export async function GET() {
  try {
    // 1. Fetch posts, including author and content blocks for preview generation.
    const posts = await prisma.post.findMany({
      where: {
        published: true, // Optional: You might want to only show published posts
      },
      orderBy: {
        createdAt: "desc", // Get the newest posts first
      },
      include: {
        author: true, // Includes the related User object
        blocks: {
          // Includes related ContentBlock objects
          where: {
            // Optimization: Only fetch the first paragraph block to create a preview
            type: "PARAGRAPH",
          },
          orderBy: {
            order: "asc",
          },
          take: 1, // We only need the very first one
        },
      },
    });

    // 2. Map the data to the format your frontend components expect.
    const formattedPosts = posts.map((post) => {
      // Find the first paragraph block to use as a preview.
      const firstParagraphBlock = post.blocks[0];
      let previewContent = "";

      if (firstParagraphBlock && firstParagraphBlock.type === "PARAGRAPH") {
        // Safely access the text content from the JSON data field.
        const data = firstParagraphBlock.data as { text: string };
        previewContent =
          data.text.substring(0, 150) + (data.text.length > 150 ? "..." : "");
      }

      return {
        id: post.id,
        title: post.title,
        // ✅ NEW: Generated from the first paragraph block.
        previewContent: previewContent,
        // ✅ UPDATED: Correct field name from schema for the post's cover image.
        coverImageUrl: post.coverImageUrl,
        createdAt: post.createdAt.toISOString(),
        author: post.author.name,
        // ✅ UPDATED: Prioritize the author's saved image URL, fallback to initials.
        authorImage: post.author.imageUrl || getInitials(post.author.name),
      };
    });

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
