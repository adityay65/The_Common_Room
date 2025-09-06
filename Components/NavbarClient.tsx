'use client'; // This directive marks the file as a Client Component

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react'; // Import the Search icon

// Define the User type again here or import it from a shared types file
type UserData = { // Renamed to avoid conflict with the icon name
  id: number;
  name: string | null;
  email: string | null;
  image?: string | null;
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
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-20">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-blue-600">The Common Room</h1>
          </div>
          
          {/* ✨ FIXED: Search bar is now implemented */}
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
              {user.image ? (
                <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-blue-500 text-white flex items-center justify-center font-bold text-xl">
                  {userInitials}
                </div>
              )}
            </button>
            {isDropdownOpen && (
              <div ref={dropdownRef} className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-50 overflow-hidden">
                {/* ✨ FIXED: Added user avatar to the dropdown for consistency */}
                <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex-shrink-0 flex items-center justify-center font-bold text-xl">
                    {user.image ? <img src={user.image} alt="Profile" className="w-full h-full object-cover rounded-full" /> : userInitials}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
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
  );
}