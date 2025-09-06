'use client';

// Define or import the Post type
type Post = {
  id: number;
  title: string;
  author: { name: string | null };
  authorImage: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
};

export default function PostCard({ post }: { post: Post }) {
  const postImageUrl = post.imageUrl || 'https://placehold.co/600x400/cccccc/FFFFFF?text=Post+Image';
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
      <img className="h-48 w-full object-cover" src={postImageUrl} alt={`Image for ${post.title}`} />
      <div className="p-6">
        <p className="text-sm text-gray-500 mb-2">{new Date(post.createdAt).toLocaleDateString()}</p>
        <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{post.title}</h3>
        <p className="text-gray-600 text-base mb-4 h-20 overflow-hidden">{post.content}</p>
        <div className="border-t border-gray-100 pt-4 flex items-center justify-between mt-4">
          <div className="flex items-center">
             <div className="w-10 h-10 rounded-full mr-3 bg-blue-500 text-white flex items-center justify-center font-bold">
               {post.authorImage}
             </div>
            <span className="text-gray-800 font-semibold">{post.author.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}