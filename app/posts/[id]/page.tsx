// app/posts/[id]/page.tsx
import prisma from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import NavbarClient from '@/Components/NavbarClient';

// Fetch a single post by ID
async function getPostById(id: string) {
  const postId = parseInt(id, 10);
  if (isNaN(postId)) return null;

  return await prisma.post.findUnique({
    where: { id: postId },
    include: { author: { select: { name: true } } },
  });
}

// Fetch user data from token
async function getUserData() {
  const cookieStore = cookies();
  const token = (await cookieStore).get('token')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey123") as { id: number };
    return await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, imageUrl: true },
    });
  } catch {
    return null;
  }
}

// Server Component for single post page
export default async function SinglePostPage({ params }: { params: { id: string } }) {
  const user = await getUserData();
  if (!user) redirect('/signin');
    const { id } = await params;
    const post = await getPostById(id);
//   const post = await getPostById(params.id);
  if (!post) notFound();

  const postImageUrl = post.imageUrl || 'https://placehold.co/1200x600/cccccc/FFFFFF?text=Blog+Post';

  return (  
    <div className="bg-gray-50 min-h-screen font-sans">
      <NavbarClient user={user} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">{post.title}</h1>
          <div className="flex items-center text-gray-500 mb-6">
            <p>By <span className="font-semibold text-gray-800">{post.author.name}</span></p>
            <span className="mx-2">•</span>
            <p>{new Date(post.createdAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}</p>
          </div>

          <img
            src={postImageUrl}
            alt={`Cover image for ${post.title}`}
            className="w-full h-auto max-h-96 object-cover rounded-lg mb-8"
          />

          <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
            <p style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>
          </div>
        </article>
      </main>
    </div>
  );
}
