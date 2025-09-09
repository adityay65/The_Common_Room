import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import NavbarClient from "@/Components/NavbarClient";
import { BlockType } from "@prisma/client";

async function getPostById(id: string) {
  const postId = parseInt(id, 10);
  if (isNaN(postId)) return null;

  return await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: { select: { name: true, imageUrl: true } },
      blocks: { orderBy: { order: "asc" } },
    },
  });
}

async function getUserData() {
  const token = (await cookies()).get("token")?.value;
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

function ContentBlock({
  block,
}: {
  block: { type: BlockType; data: any; id: number };
}) {
  switch (block.type) {
    case BlockType.HEADING_ONE:
      return (
        <h1 className="text-2xl font-bold mt-6 mb-2">{block.data.text}</h1>
      );
    case BlockType.HEADING_TWO:
      return <h2 className="text-xl font-bold mt-6 mb-2">{block.data.text}</h2>;
    case BlockType.PARAGRAPH:
      return <p className="my-4 whitespace-pre-wrap">{block.data.text}</p>;
    case BlockType.IMAGE:
      return (
        <figure className="my-8">
          <div className="w-full h-96 rounded-lg bg-white flex items-center justify-center">
            {" "}
            {/* Changed bg-gray-100 to bg-white */}
            <img
              src={block.data.url}
              alt={block.data.alt || "Blog image"}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          {block.data.caption && (
            <figcaption className="text-center text-sm text-gray-500 mt-2">
              {block.data.caption}
            </figcaption>
          )}
        </figure>
      );
    case BlockType.CODE:
      return (
        <pre className="bg-gray-800 text-white p-4 rounded-md my-4 overflow-x-auto">
          <code>{block.data.code}</code>
        </pre>
      );
    case BlockType.LIST_ITEM:
      return <li className="my-2">{block.data.text}</li>;
    default:
      return null;
  }
}

export default async function SinglePostPage({
  params,
}: {
  params: { id: string };
}) {

  const { id } = params; // ⬅️ FIXED

  const user = await getUserData();
  if (!user) redirect("/signin");

  const post = await getPostById(params.id);
  if (!post) notFound();

  const postImageUrl =
    post.coverImageUrl ||
    "https://placehold.co/1200x600/E2E8F0/4A5568?text=Blog+Post";

  return (
    <div className="bg-gray-50 min-h-screen font-body">
      <NavbarClient user={user} />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <article className="bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            {post.title}
          </h1>
          <div className="flex items-center text-gray-500 mb-6 text-sm">
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
          <div className="w-full h-96 rounded-lg bg-white flex items-center justify-center mb-8">
            {" "}
            {/* Changed bg-gray-100 to bg-white */}
            <img
              src={postImageUrl}
              alt={`Cover for ${post.title}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="prose max-w-none text-gray-800 leading-relaxed">
            {post.blocks.map((block) => (
              <ContentBlock key={block.id} block={block} />
            ))}
          </div>
        </article>
      </main>
    </div>
  );
}
