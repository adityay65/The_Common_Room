import Link from 'next/link';
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center gap-6">
          <div className="flex justify-center items-center gap-x-6 md:gap-x-8 text-sm font-medium">
            <Link href="/dashboard" className="hover:text-white transition-colors duration-200">
              Home
            </Link>
            <Link href="/aboutus" className="hover:text-white transition-colors duration-200">
              About Us
            </Link>
            <Link href="/aboutus#contact-us" className="hover:text-white transition-colors duration-200">
              Contact
            </Link>
          </div>
          <div className="border-t border-slate-800 w-full max-w-md mt-4 pt-6">
            <p className="text-center text-xs text-slate-500">
              &copy; {new Date().getFullYear()} The Common Room. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
