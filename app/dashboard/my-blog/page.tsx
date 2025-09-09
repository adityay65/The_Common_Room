// /app/my-blog/page.tsx (or similar path)

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavbarClient from "@/Components/NavbarClient";
import MyBlogCard from "@/Components/MyBlog";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

// Define the types for User and the Post (as shaped by our API)
type User = {
  id: number;
  name: string | null;
  email: string | null;
  imageUrl: string | null;
};

// ✅ UPDATED Post type to match the API response
type Post = {
  id: number;
  title: string;
  published: boolean;
  author: { name: string | null };
  previewContent: string; // Using preview from the API
  coverImageUrl: string | null; // Using the correct field name
  createdAt: Date;
};

export default function MyBlogPage() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch user data (no changes here)
        const userRes = await fetch("/api/user/me");
        if (!userRes.ok) {
          router.push("/signin");
          return;
        }
        const userData = await userRes.json();
        setUser(userData);

        // Fetch posts from our updated API
        const postsRes = await fetch("/api/my-blogs");
        if (!postsRes.ok) throw new Error("Failed to fetch posts");
        const userPosts = await postsRes.json();

        // ✅ SIMPLIFIED: No need for client-side mapping anymore.
        // The API now returns the data in the exact shape we need.
        setPosts(userPosts);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        // Optionally, set an error state here to show a message to the user
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-700">
            Loading Your Posts...
          </p>
          <p className="text-gray-500">Just a moment!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {user && <NavbarClient user={user} />}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">My Blog Posts</h2>
          <Link
            href="/write"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300"
          >
            <PlusCircle size={20} className="mr-2" />
            Create New Post
          </Link>
        </div>

        {posts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <MyBlogCard
                key={post.id}
                post={post}
                // The onPostDeleted callback tells the UI to remove the card immediately
                // without needing to re-fetch the whole list.
                onPostDeleted={() =>
                  setPosts((currentPosts) =>
                    currentPosts.filter((p) => p.id !== post.id)
                  )
                }
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg bg-white">
            <p className="text-xl font-semibold text-gray-600">
              You haven&apos;t created any posts yet.
            </p>
            <p className="text-gray-500 mt-2">
              Click &quot;Create New Post&quot; to share your thoughts!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
