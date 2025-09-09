// File: app/write/page.tsx (Updated Version)

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BlockType } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import {
  Heading1,
  Heading2,
  Pilcrow,
  Image as ImageIcon,
  Code,
  List,
  Trash2,
  UploadCloud,
} from "lucide-react";

type EditorBlock = {
  id: string;
  type: BlockType;
  data: any;
  isUploading?: boolean;
};

export default function WriteBlogPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [blocks, setBlocks] = useState<EditorBlock[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ 1. ADDED state and ref for the COVER image upload
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [userId, setUserId] = useState<number | null>(null);

  // Ref for IN-POST images
  const blockFileInputRef = useRef<HTMLInputElement>(null);
  const [activeImageBlockId, setActiveImageBlockId] = useState<string | null>(
    null
  );

  // --- Block Management Handlers (Unchanged) ---
  const addBlock = (type: BlockType) => {
    let newBlock: EditorBlock;
    switch (type) {
      //... (no changes in this function)
      case BlockType.HEADING_ONE:
        newBlock = { id: uuidv4(), type, data: { text: "" } };
        break;
      case BlockType.HEADING_TWO:
        newBlock = { id: uuidv4(), type, data: { text: "" } };
        break;
      case BlockType.IMAGE:
        newBlock = { id: uuidv4(), type, data: { url: "", caption: "" } };
        break;
      case BlockType.CODE:
        newBlock = { id: uuidv4(), type, data: { code: "" } };
        break;
      case BlockType.LIST_ITEM:
        newBlock = { id: uuidv4(), type, data: { text: "" } };
        break;
      default:
        newBlock = {
          id: uuidv4(),
          type: BlockType.PARAGRAPH,
          data: { text: "" },
        };
    }
    setBlocks([...blocks, newBlock]);
  };
  const updateBlock = (id: string, newData: any, isUploading?: boolean) => {
    console.log("🔍 updateBlock called:", {
      id,
      newData,
      isUploading,
      currentBlocks: blocks.length,
    });

    setBlocks((prevBlocks) => {
      const updated = prevBlocks.map((block) =>
        block.id === id ? { ...block, data: newData, isUploading } : block
      );

      console.log(
        "🔍 updateBlock result:",
        updated.map((b) => ({
          id: b.id,
          type: b.type,
          data: b.data,
          isUploading: b.isUploading,
        }))
      );

      return updated;
    });
  };
  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter((block) => block.id !== id));
  };

  // ✅ 2. NEW handler specifically for the COVER image
  const handleCoverImageFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsCoverUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/posts/write/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      console.log("🔍 Cover upload result:", result);
      if (result.success) {
        console.log("🔍 Cover image uploaded:", result.url);
        setCoverImageUrl(result.url);
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error(error);
      alert("Cover image upload failed.");
    } finally {
      setIsCoverUploading(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = "";
    }
  };

  // Handler for IN-POST images (unchanged logic)
  const handleBlockImageFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !activeImageBlockId) return;
    const blockIdToUpdate = activeImageBlockId;
    setBlocks(
      blocks.map((b) =>
        b.id === blockIdToUpdate ? { ...b, isUploading: true } : b
      )
    );
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("/api/posts/write/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        const targetBlock = blocks.find((b) => b.id === blockIdToUpdate);
        if (targetBlock) {
          updateBlock(
            blockIdToUpdate,
            { ...targetBlock.data, url: result.url },
            false
          );
        }
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error(error);
      alert("Image upload failed.");
      setBlocks(
        blocks.map((b) =>
          b.id === blockIdToUpdate ? { ...b, isUploading: false } : b
        )
      );
    } finally {
      if (blockFileInputRef.current) blockFileInputRef.current.value = "";
      setActiveImageBlockId(null);
    }
  };

  const triggerBlockImageUpload = (blockId: string) => {
    setActiveImageBlockId(blockId);
    blockFileInputRef.current?.click();
  };

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/me");

        if (res.ok) {
          const user = await res.json();
          console.log("🔍 User data:", user);
          setUserId(user?.id || null);
        } else {
          console.log("🔍 Not authenticated, using test user ID");
          // For testing purposes, set a default user ID
          setUserId(1); // Change this to an actual user ID from your database
        }
      } catch (error) {
        console.error("🔍 Auth error:", error);
        setUserId(1); // Fallback for testing
      }
    }
    fetchUser();
  }, []);

  // --- Form Submission (Unchanged) ---
  // Find this section in your code (around line 140-170)

  // --- Form Submission (REPLACE THIS ENTIRE SECTION) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      title,
      coverImageUrl,
      published: true,
      authorId: userId,
      blocks: blocks.map((block, index) => ({
        order: index + 1,
        type: block.type,
        data: block.data,
      })),
    };

    // Check each block
    payload.blocks.forEach((block, index) => {
      console.log(`Block ${index + 1}:`, {
        order: block.order,
        type: block.type,
        data: block.data,
        hasImageUrl: block.type === "IMAGE" ? !!block.data?.url : "N/A",
      });
    });

    try {
      const response = await fetch("/api/posts/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create post.");
      }

      router.push(`/posts/${result.id}`);
    } catch (error) {
      console.error("Submit Error:", error);
      alert(
        error instanceof Error ? error.message : "An unknown error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Logic ---
  const renderBlock = (block: EditorBlock) => {
    const { id, type, data, isUploading } = block;
    console.log("🔍 Rendering block:", { data });

    if (type === BlockType.IMAGE) {
      return (
        <div className="p-4 bg-gray-100 rounded-lg text-center">
          {isUploading ? (
            <div className="h-40 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-600">Uploading...</p>
            </div>
          ) : data.url ? (
            <img
              src={data.url}
              alt={data.caption || "Uploaded image"}
              className="max-w-full rounded-md my-2 mx-auto"
            />
          ) : (
            <div className="h-40 flex flex-col items-center justify-center bg-gray-200 rounded-md">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}
          <div className="mt-2 space-y-2">
            <input
              type="text"
              value={data.caption}
              onChange={(e) =>
                updateBlock(id, { ...data, caption: e.target.value })
              }
              placeholder="Image caption (optional)"
              className="w-full p-2 border rounded-md"
              disabled={isUploading}
            />
            {/* ✅ 3. REMOVED the URL input. The button is now the only way. */}
            <button
              type="button"
              onClick={() => triggerBlockImageUpload(id)}
              disabled={isUploading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400"
            >
              <UploadCloud size={18} />
              <span>{data.url ? "Change Image" : "Upload from computer"}</span>
            </button>
          </div>
        </div>
      );
    }
    // ... The rendering for all other block types remains the same
    const commonInputClass = "w-full bg-transparent focus:outline-none";
    const placeholderClass = "placeholder-gray-500";
    const renderContent = () => {
      /* ... (no changes in this switch statement) ... */ switch (type) {
        case BlockType.HEADING_ONE:
          return (
            <input
              type="text"
              value={data.text}
              onChange={(e) => updateBlock(id, { text: e.target.value })}
              placeholder="Heading 1"
              className={`${commonInputClass} text-4xl font-bold ${placeholderClass}`}
            />
          );
        case BlockType.HEADING_TWO:
          return (
            <input
              type="text"
              value={data.text}
              onChange={(e) => updateBlock(id, { text: e.target.value })}
              placeholder="Heading 2"
              className={`${commonInputClass} text-3xl font-semibold ${placeholderClass}`}
            />
          );
        case BlockType.PARAGRAPH:
          return (
            <textarea
              value={data.text}
              onChange={(e) => updateBlock(id, { text: e.target.value })}
              placeholder="Tell your story..."
              className={`${commonInputClass} text-lg resize-none min-h-[100px] leading-relaxed ${placeholderClass}`}
              rows={1}
            />
          );
        case BlockType.CODE:
          return (
            <textarea
              value={data.code}
              onChange={(e) => updateBlock(id, { code: e.target.value })}
              placeholder="Enter your code here..."
              className={`${commonInputClass} bg-gray-800 text-white font-mono p-4 rounded-md resize-none min-h-[150px]`}
            />
          );
        case BlockType.LIST_ITEM:
          return (
            <div className="flex items-center">
              <span className="mr-2">•</span>
              <input
                type="text"
                value={data.text}
                onChange={(e) => updateBlock(id, { text: e.target.value })}
                placeholder="List item"
                className={`${commonInputClass} ${placeholderClass}`}
              />
            </div>
          );
        default:
          return null;
      }
    };
    return (
      <div className="group relative my-4 flex items-start gap-2">
        <div className="flex-grow">{renderContent()}</div>
        <button
          onClick={() => deleteBlock(id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-1 rounded-full"
          aria-label="Delete block"
        >
          <Trash2 size={20} />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hidden file inputs for both cover and in-post images */}
      <input
        type="file"
        ref={coverFileInputRef}
        onChange={handleCoverImageFileChange}
        className="hidden"
        accept="image/*"
      />
      <input
        type="file"
        ref={blockFileInputRef}
        onChange={handleBlockImageFileChange}
        className="hidden"
        accept="image/*"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-gray-900">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Your Blog Title"
              className="w-full text-5xl font-extrabold border-none focus:ring-0 bg-transparent p-0 placeholder-gray-500"
              required
            />

            {/* ✅ 4. REPLACED the cover image URL input with an upload component */}
            <div className="bg-gray-100 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {isCoverUploading ? (
                    <div className="flex flex-col items-center justify-center h-32">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-2 text-gray-600">Uploading...</p>
                    </div>
                  ) : coverImageUrl ? (
                    <div className="relative group">
                      <img
                        src={coverImageUrl}
                        alt="Cover preview"
                        className="mx-auto h-40 max-w-full rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => coverFileInputRef.current?.click()}
                        className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
                      >
                        Change Image
                      </button>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <button
                          type="button"
                          onClick={() => coverFileInputRef.current?.click()}
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                          <span>Upload a file</span>
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t pt-8">
            {blocks.map((block) => (
              <div key={block.id}>{renderBlock(block)}</div>
            ))}
          </div>

          {/* Toolbar and Publish button are unchanged */}
          <div className="my-8 flex items-center justify-center gap-2 p-2 border-dashed border-2 rounded-lg">
            <button
              type="button"
              onClick={() => addBlock(BlockType.HEADING_ONE)}
              className="p-2 hover:bg-gray-200 rounded-md"
              title="Heading 1"
            >
              <Heading1 />
            </button>
            <button
              type="button"
              onClick={() => addBlock(BlockType.HEADING_TWO)}
              className="p-2 hover:bg-gray-200 rounded-md"
              title="Heading 2"
            >
              <Heading2 />
            </button>
            <button
              type="button"
              onClick={() => addBlock(BlockType.PARAGRAPH)}
              className="p-2 hover:bg-gray-200 rounded-md"
              title="Paragraph"
            >
              <Pilcrow />
            </button>
            <button
              type="button"
              onClick={() => addBlock(BlockType.IMAGE)}
              className="p-2 hover:bg-gray-200 rounded-md"
              title="Image"
            >
              <ImageIcon />
            </button>
            <button
              type="button"
              onClick={() => addBlock(BlockType.CODE)}
              className="p-2 hover:bg-gray-200 rounded-md"
              title="Code Block"
            >
              <Code />
            </button>
            <button
              type="button"
              onClick={() => addBlock(BlockType.LIST_ITEM)}
              className="p-2 hover:bg-gray-200 rounded-md"
              title="List Item"
            >
              <List />
            </button>
          </div>
          <div className="mt-12 flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !title.trim() || blocks.length === 0}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Publishing..." : "Publish Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
