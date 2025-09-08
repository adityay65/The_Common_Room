import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

// Client Components
import NavbarClient from '@/Components/NavbarClient';
import PostCard from '@/Components/PostCard';

// --- Helper: Get Initials ---
function getInitials(name?: string): string {
  if (!name) return '';
  const names = name.trim().split(' ');
  const initials = names.map((n) => n[0]).join('');
  return initials.slice(0, 2).toUpperCase();
}

// --- Fetch User Data ---
async function getUserData() {
  const cookieStore = cookies();
  const token = (await cookieStore).get('token')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secretkey123'
    ) as { id: number };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, imageUrl: true },
    });

    return user;
  } catch (error) {
    console.error('Failed to authenticate user:', error);
    return null;
  }
}

// --- Fetch Posts ---
async function getPosts() {
  const postsFromDb = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { name: true } } },
  });

  return postsFromDb.map((post) => ({
    ...post,
    authorImage: getInitials(post.author?.name),
  }));
}

// --- Page Component ---
export default async function DashboardPage() {
  const [user, posts] = await Promise.all([getUserData(), getPosts()]);

  if (!user) {
    redirect('/signin');
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
      {/* Navbar */}
      <NavbarClient user={user} />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Recent Posts</h2>
        {posts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
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
