"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  MoreVertical,
  Edit,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";

// The Post type is correct and already supports the author's image
type Post = {
  id: number;
  title: string;
  published: boolean;
  author: { name: string | null; image?: string | null };
  previewContent: string;
  coverImageUrl: string | null;
  createdAt: Date;
};

interface MyBlogCardProps {
  post: Post;
  onPostDeleted: () => void;
}

export default function MyBlogCard({ post, onPostDeleted }: MyBlogCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const postImageUrl =
    post.coverImageUrl ||
    "https://placehold.co/600x400/E2E8F0/4A5568?text=Blog";

  // This hook for closing the menu is fine, no changes needed.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  // All event handlers for delete functionality are fine, no changes needed.
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
        method: "DELETE",
      });

      if (!response.ok) {
        alert("Failed to delete the post. Please try again.");
      } else {
        onPostDeleted();
      }
    } catch (error) {
      console.error("Deletion error:", error);
      alert("An error occurred while deleting the post.");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 h-full flex flex-col relative">
        {/* Status Badge */}
        <div
          className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full flex items-center ${
            post.published
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {post.published ? (
            <Eye size={12} className="mr-1" />
          ) : (
            <EyeOff size={12} className="mr-1" />
          )}
          {post.published ? "Published" : "Draft"}
        </div>

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
            <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
              {post.title}
            </h3>
            <p className="text-gray-600 text-base min-h-[5rem] overflow-hidden">
              {post.previewContent}
            </p>
          </div>
        </Link>

        {/* Footer with author + menu */}
        <div className="border-t border-gray-100 p-6 pt-4 mt-auto flex items-center justify-between">
          <div className="flex items-center">
            {/* ✅ UPDATED: Conditionally render image or initials */}
            {post.author.image ? (
              <img
                src={post.author.image}
                alt={post.author.name || "Author"}
                className="w-10 h-10 rounded-full mr-3 object-cover bg-gray-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full mr-3 bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                {post.author.name
                  ? post.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : ""}
              </div>
            )}
            <span className="text-gray-800 font-semibold">
              {post.author.name}
            </span>
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

      {/* Delete Modal (No changes needed here) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsDeleteModalOpen(false)}
          />
          <div
            className="relative bg-white rounded-lg p-6 shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle
                  className="h-6 w-6 text-red-600"
                  aria-hidden="true"
                />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Delete Post
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this post? This action cannot
                  be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
