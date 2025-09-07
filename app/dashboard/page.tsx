import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

// Import the new Client Components
import NavbarClient from '@/Components/NavbarClient';
import PostCard from '@/Components/PostCard';

// Helper function for initials
function getInitials(name: string = ''): string {
  if (!name) return '';
  const names = name.split(' ');
  const initials = names.map(n => n[0]).join('');
  return initials.slice(0, 2).toUpperCase();
}

// --- Data Fetching Functions (Server-side) ---
async function getUserData() {
  const cookieStore = cookies();
  const token = (await cookieStore).get('token')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey123") as { id: number };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, imageUrl: true } // Fetch imageUrl from DB
    });
    return user;
  } catch (error) {
    return null;
  }
}

async function getPosts() {
  const postsFromDb = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { name: true } } }
  });

  return postsFromDb.map(post => ({
    ...post,
    authorImage: getInitials(post.author.name ?? undefined),
  }));
}

// --- Main Server Component ---
export default async function DashboardPage() {
  const [user, posts] = await Promise.all([getUserData(), getPosts()]);

  if (!user) {
    redirect('/signin');
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Pass user data as a prop to the Navbar Client Component */}
      <NavbarClient user={user} />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Recent Posts</h2>
        {posts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        ) : (
          <p className="text-center text-gray-500 col-span-full">No posts found.</p>
        )}
      </main>
    </div>
  );
}