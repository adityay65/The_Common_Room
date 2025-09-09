"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavbarClient from "@/Components/NavbarClient";
import MyBlogCard from "@/Components/MyBlog";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import Footer from "@/Components/footer";

// Define the types for User and the Post (as shaped by our API)
type User = {
  id: number;
  name: string | null;
  email: string | null;
  imageUrl: string | null;
};

type Post = {
  id: number;
  title: string;
  published: boolean;
  author: { name: string | null };
  previewContent: string;
  coverImageUrl: string | null;
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
        // Fetch user data
        const userRes = await fetch("/api/user/me");
        if (!userRes.ok) {
          router.push("/signin");
          return;
        }
        const userData = await userRes.json();
        setUser(userData);

        // Fetch posts from our API
        const postsRes = await fetch("/api/my-blogs");
        if (!postsRes.ok) throw new Error("Failed to fetch posts");
        const userPosts = await postsRes.json();
        setPosts(userPosts);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="text-center">
          <p className="text-xl font-semibold text-slate-700">
            Loading Your Posts...
          </p>
          <p className="text-slate-500">Just a moment!</p>
        </div>
      </div>
    );
  }

  return (
    // --- Edit: Added flex flex-col to make the footer stick to the bottom ---
    <div className="bg-slate-50 min-h-screen font-sans flex flex-col">
      {user && <NavbarClient user={user} />}

      {/* --- Edit: Added flex-grow to make the main content fill the space --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">My Blog Posts</h2>
          <Link
            href="/write"
            className="inline-flex items-center px-5 py-2.5 bg-slate-800 text-white font-semibold rounded-lg shadow-md hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-700 transition-colors duration-300"
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
                onPostDeleted={() =>
                  setPosts((currentPosts) =>
                    currentPosts.filter((p) => p.id !== post.id)
                  )
                }
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-slate-300 rounded-lg bg-white mt-8">
            <p className="text-xl font-semibold text-slate-600">
              You haven&apos;t created any posts yet.
            </p>
            <p className="text-slate-500 mt-2">
              Click &quot;Create New Post&quot; to share your thoughts!
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
