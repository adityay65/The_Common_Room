import Link from "next/link";
import Image from "next/image";

// ✅ UPDATED the Post type to match the data from getPosts
type Post = {
  id: number;
  title: string;
  author: string;
  authorImage: string; // This will now be either a URL or initials
  previewContent: string; // Use the new preview field
  coverImageUrl: string | null; // Use the correct image field
  createdAt: Date;
};

export default function PostCard({ post }: { post: Post }) {
  // Use a placeholder if the cover image is missing.
  const coverImage =
    post.coverImageUrl ||
    "https://placehold.co/600x400/E2E8F0/475569?text=Post";

  const authorName = post.author || "Anonymous";

  // Check if the authorImage is a valid URL before using it
  const isAuthorUrl = post.authorImage && post.authorImage.startsWith("http");

  return (
    // The entire card is a link to the full post page.
    <Link href={`/posts/${post.id}`} className="group block">
      <article className="h-full bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
        {/* Post Cover Image */}
        <div className="relative aspect-video overflow-hidden rounded-t-xl bg-slate-200">
          <Image
            src={coverImage}
            alt={`Cover image for ${post.title}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized={true}
          />
        </div>

        {/* Post Content */}
        <div className="p-6 flex flex-col flex-grow">
          {/* Post Title */}
          <h3 className="text-xl font-bold font-serif text-slate-800 group-hover:text-slate-950 transition-colors">
            {post.title}
          </h3>

          {/* Post Preview Text */}
          <p className="mt-3 text-slate-600 text-sm leading-relaxed flex-grow">
            {post.previewContent}
            <Link
              href={`/posts/${post.id}`}
              className="text-blue-500 font-semibold ml-1 transition-transform duration-200 hover:scale-105 hover:underline hover:underline-offset-2 hover:decoration-blue-500"
            >
              Read more
            </Link>
          </p>

          {/* Author and Date Footer */}
          <footer className="mt-6 pt-4 border-t border-slate-200/80 flex items-center gap-x-3">
            <div className="relative h-10 w-10 flex-shrink-0">
              {/* Use the isAuthorUrl check to conditionally render the Image or the initials */}
              {isAuthorUrl ? (
                <Image
                  src={post.authorImage}
                  alt={authorName}
                  fill
                  sizes="40px"
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-slate-700 text-white flex items-center justify-center rounded-full font-semibold text-sm">
                  {/* If not a URL, authorImage contains the initials */}
                  {post.authorImage}
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-700">
                {authorName}
              </p>
              <p className="text-xs text-slate-500">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </footer>
        </div>
      </article>
    </Link>
  );
}
