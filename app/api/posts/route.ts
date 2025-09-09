// app/api/posts/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client"; // --- ADDED: Import types for Prisma queries

/**
 * A helper function to generate initials from a name.
 */
function getInitials(name: string): string {
  if (!name) return "";
  const names = name.split(" ");
  const initials = names.map((n) => n[0]).join("");
  return initials.slice(0, 2).toUpperCase();
}

// --- MODIFIED: Added 'request' parameter to access the URL
export async function GET(request: Request) {
  try {
    // --- ADDED: Extract search query from URL ---
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("search");

    // --- ADDED: Create a dynamic 'where' clause for the Prisma query ---
    const whereClause: Prisma.PostWhereInput = {
      published: true, // Always filter for published posts
    };

    if (query) {
      // If a search query is present, add conditions to search title and author name
      whereClause.OR = [
        {
          title: {
            contains: query,
          },
        },
        {
          author: {
            name: {
              contains: query,
            },
          },
        },
      ];
    }
    // --- END OF ADDITIONS ---

    // 1. Fetch posts using the dynamic where clause.
    const posts = await prisma.post.findMany({
      // --- MODIFIED: Use the dynamic whereClause ---
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: true,
        blocks: {
          where: {
            type: "PARAGRAPH",
          },
          orderBy: {
            order: "asc",
          },
          take: 1,
        },
      },
    });

    // 2. Map the data to the format your frontend components expect.
    //    (This part remains unchanged)
    const formattedPosts = posts.map((post) => {
      const firstParagraphBlock = post.blocks[0];
      let previewContent = "";

      if (firstParagraphBlock && firstParagraphBlock.type === "PARAGRAPH") {
        const data = firstParagraphBlock.data as { text: string };
        previewContent =
          data.text.substring(0, 150) + (data.text.length > 150 ? "..." : "");
      }

      return {
        id: post.id,
        title: post.title,
        previewContent: previewContent,
        coverImageUrl: post.coverImageUrl,
        createdAt: post.createdAt.toISOString(),
        author: post.author.name,
        authorImage: post.author.imageUrl || getInitials(post.author.name!),
      };
    });

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json(
      { error: "Unable to fetch posts." },
      { status: 500 }
    );
  }
}
