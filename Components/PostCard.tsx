// Components/PostCard.tsx

"use client";

import Link from "next/link";

// ✅ UPDATED the Post type to match the data from getPosts
type Post = {
  id: number;
  title: string;
  author: { name: string | null };
  authorImage: string; // This will now be either a URL or initials
  previewContent: string; // Use the new preview field
  coverImageUrl: string | null; // Use the correct image field
  createdAt: Date;
};

export default function PostCard({ post }: { post: Post }) {
  // ✅ Use the correct field and a more descriptive placeholder
  const postImageUrl =
    post.coverImageUrl ||
    "https://placehold.co/600x400/E2E8F0/4A5568?text=Blog";

  // Helper to check if the authorImage is a URL or initials
  const isAuthorImageURL = post.authorImage.startsWith("http");

  return (
    <Link href={`/posts/${post.id}`} className="block group">
      <div className="bg-white rounded-xl shadow-md overflow-hidden group-hover:shadow-xl transition-shadow duration-300 transform group-hover:-translate-y-1 h-full flex flex-col">
        <img
          className="h-48 w-full object-cover"
          src={postImageUrl}
          alt={`Cover image for ${post.title}`}
        />
        <div className="p-6 flex flex-col flex-grow">
          <p className="text-sm text-gray-500 mb-2">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
          <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
            {post.title}
          </h3>

          {/* ✅ Use the previewContent field */}
          <p className="text-gray-600 text-base mb-4 min-h-[4.5rem] overflow-hidden">
            {post.previewContent}
          </p>

          <div className="border-t border-gray-100 pt-4 mt-auto">
            <div className="flex items-center">
              {/* ✅ Conditionally render image or initials */}
              {isAuthorImageURL ? (
                <img
                  src={post.authorImage}
                  alt={post.author.name ?? "Author"}
                  className="w-10 h-10 rounded-full mr-3 object-cover bg-gray-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full mr-3 bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                  {post.authorImage}
                </div>
              )}
              <span className="text-gray-800 font-semibold">
                {post.author.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
