
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


// Import the Client Components (These are assumed to exist and are not changed)
import NavbarClient from "@/Components/NavbarClient";
import PostCard from "@/Components/PostCard";
import Footer from "@/Components/footer";
import SearchCleanup from "@/Components/SearchCleanUp";

// Helper function for initials (no changes needed here)
function getInitials(name: string = ""): string {
  if (!name) return "";
  const names = name.split(" ");
  const initials = names.map((n) => n[0]).join("");
  return initials.slice(0, 2).toUpperCase();
}

// --- Data Fetching Functions (Server-side, unchanged) ---


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

[user, posts] = await Promise.all([getUserData(), getPosts()]);

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

    // --- Edit: Added flex flex-col for sticky footer ---
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 flex flex-col">
      <NavbarClient user={user} />

      {/* --- Edit: Added flex-grow to make main content fill space --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex-grow w-full">
        {/* --- UI Refresh: New header section with a personalized welcome and a clear "Create Post" CTA --- */}
        <header className="pb-8 mb-10 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              {/* --- Edit: Changed to a serif font and reduced size for a more refined look --- */}
              <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                Welcome back, {user.name?.split(" ")[0]}!
              </h2>

              {/* --- Edit: Reduced text size for better balance and readability --- */}
              <p className="mt-2 text-base text-slate-600 max-w-2xl">
                We realized the most transformative learning often happens on a
                weekend trek or a cultural trip... The Common Room was created
                to give those memories a home.
              </p>
            </div>

            <a
              href="/write"
              className="flex-shrink-0 inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-slate-50 shadow-sm transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-950"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              <span>Create Post</span>
            </a>
          </div>
        </header>

        {/* --- UI Refresh: Main posts section with a clear heading --- */}
        <section aria-labelledby="latest-posts-heading">
          <h2
            id="latest-posts-heading"
            className="text-2xl font-bold text-slate-900 mb-8"
          >
            Latest Articles
          </h2>

          {posts.length > 0 ? (
            // --- UI Refresh: Grid with more generous spacing for a cleaner look ---
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            // --- UI Refresh: A more visually appealing and helpful empty state ---
            <div className="text-center bg-white rounded-xl shadow-sm p-12 mt-10 border border-slate-200/80">
              <svg
                className="mx-auto h-12 w-12 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-4 text-xl font-semibold text-slate-800">
                No Articles Found
              </h3>
              <p className="mt-2 text-slate-500">
                It looks a little empty here. Be the first to publish an
                article!
              </p>
              <div className="mt-6">
                <a
                  href="/editor/new"
                  className="inline-flex items-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-slate-50 shadow-sm transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-950"
                >
                  <svg
                    className="-ml-1 mr-2 h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </svg>
                  Write your first article
                </a>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
