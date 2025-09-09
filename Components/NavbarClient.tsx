"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Camera, Search } from "lucide-react";

type UserData = {
  id: number;
  name: string | null;
  email: string | null;
  imageUrl?: string | null;
};

// Helper function for initials
function getInitials(name: string = ""): string {
  if (!name) return "";
  const names = name.split(" ");
  const initials = names.map((n) => n[0]).join("");
  return initials.slice(0, 2).toUpperCase();
}

export default function NavbarClient({ user }: { user: UserData }) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(user.imageUrl);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- ADDED FOR SEARCH ---
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const pathname = usePathname(); // CORRECT HOOK for Next.js
  // --- END OF ADDITIONS ---

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const userInitials = getInitials(user.name ?? undefined);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // ... your existing code ...
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", user.id.toString());
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        setCurrentImageUrl(result.imageUrl);
      } else {
        alert("Upload failed: " + result.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };
  // --- End of Unchanged Logic ---

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent page reload
    if (searchTerm.trim()) {
      router.push(`/dashboard?search=${searchTerm}`);
    } else {
      router.push("/dashboard");
    }
  };

  const ProfileImage = ({
    size = "w-10 h-10",
    clickable = false,
  }: {
    size?: string;
    clickable?: boolean;
  }) => {
    // ... your existing code ...
    const imageContent = currentImageUrl ? (
      <img
        src={currentImageUrl}
        alt="Profile"
        className="w-full h-full object-cover rounded-full"
      />
    ) : (
      <div className="w-full h-full bg-slate-700 text-white flex items-center justify-center font-bold text-base rounded-full">
        {userInitials}
      </div>
    );
    if (clickable) {
      return (
        <button
          onClick={triggerFileUpload}
          disabled={isUploading}
          className={`${size} rounded-full relative group overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-700 ${
            isUploading
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:opacity-80"
          }`}
        >
          {imageContent}

          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 flex items-center justify-center transition-all duration-200 rounded-full">
            <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-full">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </button>
      );
    }
    return (
      <div className={`${size} rounded-full overflow-hidden`}>
        {imageContent}
      </div>
    );
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* --- UI Refresh: Main header with consistent border and background --- */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-30">
        {/* --- UI Refresh: Increased max-width and responsive padding --- */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* --- UI Refresh: Flexbox for alignment and consistent height --- */}
          <div className="flex items-center justify-between h-16">
            {/* --- UI Refresh: Professional Logo & Nav Links --- */}
            <div className="flex items-center gap-x-10">
              {/* Eye-catching Logo */}
              <Link
                href="/dashboard"
                className="flex items-center gap-x-2.5 flex-shrink-0 group"
              >
                <div className="bg-slate-900 rounded-lg p-2 transition-transform group-hover:scale-105">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-users"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-slate-950 transition-colors">
                  The Common Room
                </h1>
              </Link>
              {/* Professional Navigation Links */}
              <div className="hidden md:flex items-center gap-x-4 text-sm font-medium text-slate-600 border-l border-slate-200 pl-8 ml-2">
                <Link
                  href="/aboutus"
                  className="px-3 py-1.5 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-colors duration-200"
                >
                  About Us
                </Link>
                <Link
                  href="/aboutus#contact-us"
                  className="px-3 py-1.5 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-colors duration-200"
                >
                  Contact
                </Link>
              </div>
            </div>

            {/* --- UI Refresh: Grouping search and profile together --- */}
            <div className="flex items-center gap-x-4">
              <div className="hidden md:block relative">
                {pathname === "/dashboard" && ( // CHANGED: usePathname hook
                  <form
                    onSubmit={handleSearchSubmit} // ADDED: Form submission handler
                    className="relative flex-1 max-w-md" // Simplified classes
                  >
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search Title..."
                      value={searchTerm} // ADDED: Connect to state
                      onChange={(e) => setSearchTerm(e.target.value)} // ADDED: Update state on change
                      className="w-full py-2 pl-10 pr-4 text-gray-700 bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </form>
                )}
              </div>

              {/* --- Profile Dropdown --- */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!isDropdownOpen)}
                  className="w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 overflow-hidden"
                >
                  <ProfileImage />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 origin-top-right bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 z-50 focus:outline-none">
                    <div className="p-4 border-b border-slate-200">
                      <div className="flex items-center space-x-4">
                        <ProfileImage size="w-14 h-14" clickable={true} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 truncate">
                            {user.name}
                          </p>
                          <p className="text-sm text-slate-500 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <a
                        href="/dashboard/profile"
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        Update Profile
                      </a>
                      <a
                        href="/dashboard/my-blog"
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        My Blogs
                      </a>
                    </div>
                    <div className="border-t border-slate-200">
                      <a
                        href="/api/auth/signout"
                        className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}
