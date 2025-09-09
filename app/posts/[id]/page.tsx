import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import NavbarClient from "@/Components/NavbarClient";
import { BlockType } from "@prisma/client"; // Import the enum for type safety

// ✅ UPDATED: Now includes the content blocks, ordered correctly.
async function getPostById(id: string) {
  const postId = parseInt(id, 10);
  if (isNaN(postId)) return null;

  return await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: { name: true, imageUrl: true }, // Also fetch author image for the header
      },
      blocks: {
        orderBy: {
          order: "asc", // Ensure blocks are in the correct sequence
        },
      },
    },
  });
}

// Fetch user data from token (No changes needed here)
async function getUserData() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secretkey123"
    ) as { id: number };
    return await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, imageUrl: true },
    });
  } catch {
    return null;
  }
}

// A helper component to render a single content block
// This keeps the main component cleaner.
function ContentBlock({ block }: { block: { type: BlockType; data: any } }) {
  const { type, data } = block;

  switch (type) {
    case BlockType.HEADING_ONE:
      return <h1 className="text-3xl font-bold mt-6 mb-2">{data.text}</h1>;
    case BlockType.HEADING_TWO:
      return <h2 className="text-2xl font-bold mt-6 mb-2">{data.text}</h2>;
    case BlockType.PARAGRAPH:
      // Using pre-wrap to respect newlines from the editor
      return (
        <p className="my-4" style={{ whiteSpace: "pre-wrap" }}>
          {data.text}
        </p>
      );
    case BlockType.IMAGE:
      return (
        <figure className="my-8 flex flex-col items-center">
          <img
            src={data.url}
            alt={data.alt || "Blog post image"}
            className="max-w-full h-auto rounded-lg"
          />
          {data.caption && (
            <figcaption className="text-center text-sm text-gray-500 mt-2">
              {data.caption}
            </figcaption>
          )}
        </figure>
      );

    case BlockType.CODE:
      // Basic code block styling
      return (
        <pre className="bg-gray-800 text-white p-4 rounded-md my-4 overflow-x-auto">
          <code>{data.code}</code>
        </pre>
      );
    case BlockType.LIST_ITEM:
      return <li className="my-2">{data.text}</li>; // Note: This should be wrapped in a <ul> or <ol>
    default:
      return null; // Or render a placeholder for unknown block types
  }
}

// Server Component for single post page
export default async function SinglePostPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params; // ⬅️ FIXED
  const user = await getUserData();
  if (!user) redirect("/signin");

  const post = await getPostById(id);
  if (!post) notFound();

  // ✅ UPDATED: Use 'coverImageUrl' from the schema
  const postImageUrl =
    post.coverImageUrl ||
    "https://placehold.co/1200x600/E2E8F0/4A5568?text=Blog+Post";

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <NavbarClient user={user} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
            {post.title}
          </h1>
          <div className="flex items-center text-gray-500 mb-6">
            <p>
              By{" "}
              <span className="font-semibold text-gray-800">
                {post.author.name}
              </span>
            </p>
            <span className="mx-2">•</span>
            <p>
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <img
            src={postImageUrl}
            alt={`Cover image for ${post.title}`}
            className="w-full h-auto max-h-96 object-cover rounded-lg mb-8"
          />

          {/* ✅ UPDATED: Render the blocks instead of a single 'content' field */}
          <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
            {post.blocks.map((block) => (
              <ContentBlock key={block.id} block={block} />
            ))}
          </div>
        </article>
      </main>
    </div>
  );
}
