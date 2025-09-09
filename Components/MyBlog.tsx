"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image"; // --- Edit: Imported Next.js Image component
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

// --- Edit: Added formatDate helper for consistency ---
const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};


export default function MyBlogCard({ post, onPostDeleted }: MyBlogCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const postImageUrl =
    post.coverImageUrl ||
    "https://placehold.co/600x400/E2E8F0/4A5568?text=Blog";

  const authorName = post.author.name || "Anonymous";
  const authorInitials = authorName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const isAuthorUrl = post.author.image && post.author.image.startsWith('http');

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
      {/* --- UI Refresh: Main card container with consistent styling --- */}
      <article className="h-full bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col relative">
        {/* Status Badge */}
        <div
          className={`absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full flex items-center z-10 ${
            post.published
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {post.published ? (
            <Eye size={12} className="mr-1.5" />
          ) : (
            <EyeOff size={12} className="mr-1.5" />
          )}
          {post.published ? "Published" : "Draft"}
        </div>

        {/* --- Edit: Link now wraps only the content, not the footer --- */}
        <Link href={`/posts/${post.id}`} className="group block flex-grow flex flex-col">
          {/* Post Cover Image */}
          <div className="relative aspect-video overflow-hidden rounded-t-xl bg-slate-200">
            <Image
              src={postImageUrl}
              alt={`Cover image for ${post.title}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized={true}
            />
          </div>

          {/* Post Content */}
          <div className="p-6 flex flex-col flex-grow">
            <h3 className="text-xl font-bold font-serif text-slate-800 group-hover:text-slate-950 transition-colors">
              {post.title}
            </h3>
            <p className="mt-3 text-slate-600 text-sm leading-relaxed flex-grow">
              {post.previewContent}
            </p>
          </div>
        </Link>

        {/* Footer with author + menu */}
        <footer className="mt-auto p-6 pt-4 border-t border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-x-3">
             {isAuthorUrl ? (
                <Image
                  src={post.author.image!}
                  alt={authorName}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 bg-slate-700 text-white flex items-center justify-center rounded-full font-semibold text-sm">
                  {authorInitials}
                </div>
              )}
            <div>
              <p className="font-semibold text-sm text-slate-700">{authorName}</p>
              <p className="text-xs text-slate-500">{formatDate(post.createdAt)}</p>
            </div>
          </div>

          <div ref={menuRef} className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 focus:outline-none"
            >
              <MoreVertical size={20} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-10">
                <Link
                  href={`/edit-post/${post.id}`}
                  className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
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
        </footer>
      </article>

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
