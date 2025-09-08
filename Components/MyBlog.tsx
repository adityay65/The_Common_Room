'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MoreVertical, Edit, Trash2, AlertTriangle } from 'lucide-react';

type Post = {
  id: number;
  title: string;
  author: { name: string | null };
  authorImage: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
};

interface MyBlogCardProps {
  post: Post;
  onPostDeleted: () => void; // callback to parent
}

export default function MyBlogCard({ post, onPostDeleted }: MyBlogCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const postImageUrl =
    post.imageUrl || 'https://placehold.co/600x400/cccccc/FFFFFF?text=Post+Image';

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuRef]);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleteModalOpen(true);
    setIsMenuOpen(false);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        alert('Failed to delete the post. Please try again.');
      } else {
        onPostDeleted(); // notify parent
      }
    } catch (error) {
      console.error('Deletion error:', error);
      alert('An error occurred while deleting the post.');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 h-full flex flex-col">
        {/* Main Card Content */}
        <Link href={`/posts/${post.id}`} className="block flex-grow">
          <img
            className="h-48 w-full object-cover"
            src={postImageUrl}
            alt={`Image for ${post.title}`}
          />
          <div className="p-6">
            <p className="text-sm text-gray-500 mb-2">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
            <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{post.title}</h3>
            <p className="text-gray-600 text-base min-h-[5rem] overflow-hidden">
              {post.content}
            </p>
          </div>
        </Link>

        {/* Footer with author + menu */}
        <div className="border-t border-gray-100 p-6 pt-4 mt-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full mr-3 bg-blue-500 text-white flex items-center justify-center font-bold">
              {post.authorImage}
            </div>
            <span className="text-gray-800 font-semibold">{post.author.name}</span>
          </div>

          <div ref={menuRef} className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 focus:outline-none"
            >
              <MoreVertical size={20} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-10">
                <Link
                  href={`/edit-post/${post.id}`}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit className="mr-3" size={16} />
                  <span>Edit Post</span>
                </Link>
                <button
                  onClick={handleDeleteClick}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="mr-3" size={16} />
                  <span>Delete Post</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-gray-200/40 backdrop-blur-sm shadow-inner"
            onClick={() => setIsDeleteModalOpen(false)}
          />
          <div
            className="relative bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Delete Post</h3>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete this post? <br />
                <span className="text-red-500 font-medium">This action cannot be undone.</span>
              </p>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold shadow-md hover:bg-red-700 transition disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
