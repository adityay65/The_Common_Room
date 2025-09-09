import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PostCard from "@/Components/PostCard";
import NavbarClient from "@/Components/NavbarClient";
import SearchCleanup from "@/Components/SearchCleanUp";

async function getUserData() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(
      token,

      process.env.JWT_SECRET || "secretkey123"
    ) as { id: number };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, imageUrl: true },
    });

    return user;
  } catch (error) {
    console.error("Auth Error:", error);

    return null;
  }
}

async function getPosts(search: string | null) {
  const apiUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = search
    ? `${apiUrl}/api/posts?search=${encodeURIComponent(search)}`
    : `${apiUrl}/api/posts`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

// --- Page Component ---
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>; // ✅ mark as Promise
}) {
  // ✅ Await searchParams
  const { search } = await searchParams;

  // Fetch user and post data in parallel
  const [user, posts] = await Promise.all([
    getUserData(),
    getPosts(search || ""), // ✅ pass search term to API fetch
  ]);
  if (!user) {
    redirect("/signin");
  }
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <NavbarClient user={user} />
      <SearchCleanup />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Recent Posts</h2>
        {posts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map(
              (
                post: any // Added 'any' type for post for now
              ) => (
                <PostCard key={post.id} post={post} />
              )
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500 col-span-full mt-16">
            <p>No posts have been created yet.</p>
          </div>
        )}
      </main>
      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-6">
        <div className="container mx-auto flex flex-col items-center gap-4 px-4">
          <div className="flex justify-center items-center space-x-8 md:space-x-12 text-sm">
            <a
              href="/dashboard"
              className="hover:text-white transition-colors duration-200"
            >
              Home
            </a>
            <a
              href="/aboutus"
              className="hover:text-white transition-colors duration-200"
            >
              About Us
            </a>
            <a
              href="/aboutus#contact-us"
              className="hover:text-white transition-colors duration-200"
            >
              Contact Us
            </a>
          </div>
          <div className="border-t border-gray-700 w-full max-w-4xl mt-4 pt-4">
            <p className="text-center text-xs text-gray-500">
              &copy; {new Date().getFullYear()} The_Common_Room. All Rights
              Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
