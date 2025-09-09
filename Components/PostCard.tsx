import Link from "next/link";
import Image from "next/image";

// Define the type for the 'post' prop that this component receives.
type PostCardProps = {
  post: {
    id: number;
    title: string;
    createdAt: string; // 👈 changed from Date to string (because it’s serialized from DB)
    coverImageUrl: string | null;
    previewContent: string;
    author: {
      name: string | null;
    };
    authorImage: string | null;
  };
};

// A small helper function to format the date in a more readable way.
const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function PostCard({ post }: PostCardProps) {
  // Use a placeholder if the cover image is missing.
  const coverImage =
    post.coverImageUrl || "https://placehold.co/600x400/E2E8F0/475569?text=Post";

  const authorName = post.author.name || "Anonymous";

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
          </p>

          {/* Author and Date Footer */}
          <footer className="mt-6 pt-4 border-t border-slate-200/80 flex items-center gap-x-3">
            <div className="relative h-10 w-10 flex-shrink-0">
              {/* Use the isAuthorUrl check to conditionally render the Image or the initials */}
              {isAuthorUrl ? (
                <Image
                  src={post.authorImage!}
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
                {formatDate(post.createdAt)}
              </p>
            </div>
          </footer>
        </div>
      </article>
    </Link>
  );
}
