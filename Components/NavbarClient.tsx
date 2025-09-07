'use client'; // This directive marks the file as a Client Component

import { useState, useEffect, useRef } from 'react';
import { Search, Camera, Upload } from 'lucide-react'; // Import icons

// Define the User type - updated to use imageUrl from Cloudinary
type UserData = {
  id: number;
  name: string | null;
  email: string | null;
  imageUrl?: string | null; // This will be the Cloudinary URL
};

// Helper function for initials
function getInitials(name: string = ''): string {
  if (!name) return '';
  const names = name.split(' ');
  const initials = names.map(n => n[0]).join('');
  return initials.slice(0, 2).toUpperCase();
}

export default function NavbarClient({ user }: { user: UserData }) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(user.imageUrl);
  console.log('User data in NavbarClient:', user);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  // Handle file upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id.toString());

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setCurrentImageUrl(result.imageUrl);
        // Optionally refresh the page or update the user context
        // window.location.reload(); // Uncomment if you want to refresh the page
      } else {
        alert('Upload failed: ' + result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Profile Image Component
  const ProfileImage = ({ size = "w-10 h-10", clickable = false }: { size?: string; clickable?: boolean }) => {
    const imageContent = currentImageUrl ? (
      <img 
        src={currentImageUrl} 
        alt="Profile" 
        className="w-full h-full object-cover rounded-full" 
      />
    ) : (
      <div className="w-full h-full bg-blue-500 text-white flex items-center justify-center font-bold text-xl rounded-full">
        {userInitials}
      </div>
    );

    if (clickable) {
      return (
        <button
          onClick={triggerFileUpload}
          disabled={isUploading}
          className={`${size} rounded-full relative group overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-75'
          }`}
        >
          {imageContent}
          {/* Upload overlay */}
          <div className="absolute inset-0  bg-opacity-50 group-hover:bg-opacity-50 flex items-center justify-center transition-all duration-200 rounded-full">
            <Camera className="w-4 h-4 text-black opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-20">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-blue-600">The Common Room</h1>
            </div>
            
            {/* Search bar */}
            <div className="hidden md:block relative flex-1 max-w-md mx-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search posts..."
                className="w-full py-2 pl-10 pr-4 text-gray-700 bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!isDropdownOpen)}
                className="w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 overflow-hidden"
              >
                <ProfileImage />
              </button>
              
              {isDropdownOpen && (
                <div ref={dropdownRef} className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-50 overflow-hidden">
                  {/* User info section with clickable profile image */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <ProfileImage size="w-12 h-12" clickable={true} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={triggerFileUpload}
                      disabled={isUploading}
                      className="mt-2 w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Change Photo</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <ul className="py-2">
                    <li><a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Update Profile</a></li>
                    <li><a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">My Blogs</a></li>
                  </ul>
                  
                  <div className="border-t border-gray-200">
                    <a href="/api/auth/signout" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100">Logout</a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}