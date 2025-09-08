'use client'; // This page needs to be a client component to handle state for deletion

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavbarClient from '@/Components/NavbarClient';
import MyBlogCard from '@/Components/MyBlog';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

// Define the types for User and Post
type User = {
  id: number;
  name: string | null;
  email: string | null;
  imageUrl: string | null;
};

type Post = {
  id: number;
  title: string;
  author: { name: string | null };
  authorImage: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
};

// Helper function for initials
function getInitials(name: string = ''): string {
  if (!name) return '';
  const names = name.split(' ');
  const initials = names.map(n => n[0]).join('');
  return initials.slice(0, 2).toUpperCase();
}

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
        const userRes = await fetch('/api/user/me');
        if (!userRes.ok) {
          router.push('/signin');
          return;
        }
        const userData = await userRes.json();
        setUser(userData);

        // Fetch posts
        const postsRes = await fetch('/api/my-blogs');
        if (!postsRes.ok) throw new Error('Failed to fetch posts');
        const userPosts = await postsRes.json();

        const processedPosts = userPosts.map((post: any) => ({
          ...post,
          authorImage: getInitials(post.author.name ?? ''),
        }));

        setPosts(processedPosts);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-xl text-gray-600">Loading your posts...</p>
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
            href="/create-post"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={20} className="mr-2" />
            Create New Post
          </Link>
        </div>

        {posts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map(post => (
              <MyBlogCard
                key={post.id}
                post={post}
                onPostDeleted={() =>
                  setPosts(currentPosts => currentPosts.filter(p => p.id !== post.id))
                }
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-xl text-gray-500">You haven't created any posts yet.</p>
            <p className="text-gray-400 mt-2">Click "Create New Post" to get started!</p>
          </div>
        )}
      </main>
    </div>
  );
}
