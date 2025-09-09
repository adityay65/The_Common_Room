// File: app/api/posts/write/route.ts (Enhanced with debugging)

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { BlockType } from "@prisma/client";

// Helper: Get user ID from JWT cookie
async function getUserIdFromCookies() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secretkey123"
    ) as { id: number };

    return decoded.id;
  } catch (err) {
    console.error("JWT Error:", err);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromCookies();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, coverImageUrl, published = true, blocks } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!Array.isArray(blocks) || blocks.length === 0) {
      return NextResponse.json(
        { error: "Blocks are required" },
        { status: 400 }
      );
    }

    // Validate block types
    for (const block of blocks) {
      if (!Object.values(BlockType).includes(block.type)) {
        return NextResponse.json(
          { error: `Invalid block type: ${block.type}` },
          { status: 400 }
        );
      }
    }

    // Filter out IMAGE blocks without uploaded URL
    const validBlocks = blocks.filter(
      (b) =>
        b.type !== BlockType.IMAGE ||
        (b.type === BlockType.IMAGE && b.data?.url)
    );

    // Show which blocks were filtered out
    const filteredOut = blocks.filter(
      (b) => b.type === BlockType.IMAGE && !b.data?.url
    );

    if (validBlocks.length !== blocks.length) {
      return NextResponse.json(
        {
          error:
            "Some image blocks are missing uploads. Please upload or remove them.",
          debug: {
            originalCount: blocks.length,
            validCount: validBlocks.length,
            filteredOutBlocks: filteredOut,
          },
        },
        { status: 400 }
      );
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        title,
        coverImageUrl,
        published,
        authorId: userId,
      },
    });

    // 🔍 DEBUG: Log what we're about to insert
    const blocksToInsert = validBlocks.map((block, index: number) => ({
      order: index + 1,
      type: block.type,
      data: block.data,
      postId: post.id,
    }));

    // Insert blocks with order = array index
    const createdBlocks = await prisma.contentBlock.createMany({
      data: blocksToInsert,
    });

    return NextResponse.json(
      {
        id: post.id,
        message: "Post published successfully",
        debug: {
          blocksCreated: createdBlocks.count,
          originalBlocksCount: blocks.length,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
