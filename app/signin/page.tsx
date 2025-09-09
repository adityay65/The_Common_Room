'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// A simple placeholder for social icons
// const SocialIcon = () => (
//   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
//     <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
//   </svg>
// );

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push('/dashboard');
      } else {
        const data = await res.json();
        setError(data.error || 'Sign in failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative flex h-screen w-screen bg-cover bg-center"
      style={{ backgroundImage: 'url("/images/aboutUsBackground.jpg")' }} // full-screen balloon background
    >
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Title & Quote centered vertically */}
     <div className="absolute inset-y-0 left-20 flex flex-col justify-center text-white z-10 px-10">
        <h1 className="text-6xl font-extrabold tracking-tight font-[Playfair_Display]">
          The Common Room
        </h1>
        <p className="mt-4 text-xl italic text-gray-200 max-w-lg font-[Poppins]">
          &quot;Life at IIT Ropar extends beyond the classroom. The Common Room is the digital home for our shared journeys, discoveries, and stories.&quot;
        </p>
      </div>

      {/* Right Section: Sign In Form (shifted left a bit) */}
      <div className="relative z-10 ml-auto mr-20 flex h-full w-full max-w-lg items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 rounded-2xl bg-blue-900/30 backdrop-blur-md p-10 shadow-xl border border-white/20">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-300">Sign in to access your dashboard</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-200 mb-2">
                Email Address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-3 text-sm font-medium text-center text-red-300 bg-red-900/50 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg shadow-md text-lg font-semibold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 transition"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center text-sm text-gray-300">
            Don&apos;t have an account?{' '}
            <a href="/signup" className="font-medium text-orange-400 hover:text-orange-300">
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
