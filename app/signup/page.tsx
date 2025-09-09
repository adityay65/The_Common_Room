'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        setSuccess('Account created! Redirecting to sign in...');
        setTimeout(() => {
          router.push('/signin');
        }, 100);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create account.');
      }
    } catch (err: unknown) {
  console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
          setIsLoading(false);
        }
      };

  return (
    <div
      className="relative flex h-screen w-screen bg-cover bg-center"
      style={{ backgroundImage: 'url("/images/aboutUsBackground.jpg")' }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Title & Quote with padding + new font */}
      <div className="absolute inset-y-0 left-20 flex flex-col justify-center text-white z-10 px-10">
        <h1 className="text-6xl font-extrabold tracking-tight font-[Playfair_Display]">
          The Common Room
        </h1>
        <p className="mt-4 text-xl italic text-gray-200 max-w-lg font-[Poppins]">
          &quot;Life at IIT Ropar extends beyond the classroom. The Common Room is the digital home for our shared journeys, discoveries, and stories.&quot;
        </p>
      </div>

      {/* Sign Up Box */}
      <div className="relative z-10 ml-auto mr-20 flex h-full w-full max-w-lg items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6 rounded-2xl bg-blue-900/30 backdrop-blur-md p-10 shadow-xl border border-white/20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Create an Account</h1>
          </div>
          

          <form className="space-y-5" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {success && <p className="text-green-400 text-sm">{success}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg shadow-md text-lg font-semibold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 transition"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>

            <div className="text-center text-sm text-gray-300">
              Already have an account?{' '}
              <a
                href="/signin"
                className="font-medium text-orange-400 hover:text-orange-300"
              >
                Sign In
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
