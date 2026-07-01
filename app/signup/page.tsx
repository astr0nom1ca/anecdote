'use client';

import { useState } from 'react';
import { client } from '@/sanity/lib/client';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [username, setUsername] = useState('');
  const [name, setName] = useState(''); // This will be the Real Name (e.g. Joe Adams)
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const cleanUsername = username.toLowerCase().trim();

    try {
      // 1. Check if the username already exists
      const existingUser = await client.fetch(
        `*[_type == "user" && username == $username][0]`, 
        { username: cleanUsername }
      );

      if (existingUser) {
        // --- LOGIN ---
        localStorage.setItem('locker_user_id', existingUser._id);
        router.push('/');
      } else if (!isNewUser) {
        // --- PROMPT SIGNUP ---
        setIsNewUser(true);
        setLoading(false);
        return; 
      } else {
        // --- SIGNUP (Triple Identity Logic) ---
        const user = await client.create({
          _type: 'user',
          username: cleanUsername,      // The ID (e.g. bighead300)
          displayName: cleanUsername,   // The Wacky Name (Defaults to ID)
          realName: name,               // The Legal Name (e.g. Joe Adams)
        });

        localStorage.setItem('locker_user_id', user._id);
        router.push('/');
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Check your connection!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white p-8 rounded-2xl shadow-xl border-2 border-purple-200">
        <h1 className="text-3xl font-black text-purple-600 mb-2 text-center uppercase tracking-tighter italic">
          The Locker
        </h1>
        <p className="text-gray-500 text-center mb-8 font-medium">
          {isNewUser ? "Finish creating your account" : "Sign in with your username"}
        </p>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative">
            <span className="absolute left-3 top-3 text-purple-400 font-bold">@</span>
            <input 
              type="text" 
              placeholder="username" 
              value={username}
              className="w-full p-3 pl-8 border-2 border-gray-100 rounded-xl focus:border-purple-500 outline-none text-black font-medium"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            {/* Insert this right below your input container and right above the submit button */}
            <div className="flex justify-end pr-1">
              <button
                type="button"
                onClick={() => router.push('/signup/forgot')}
                className="text-xs font-semibold text-purple-400 hover:text-purple-600 transition"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          {isNewUser && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-xs text-purple-500 mb-1 font-bold ml-1">Username available! Now, your real name:</p>
              <input 
                type="text" 
                placeholder="Real Name (e.g. Andre Harris)" 
                className="w-full p-3 border-2 border-purple-100 bg-purple-50/50 rounded-xl focus:border-purple-500 outline-none text-black"
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : isNewUser ? 'Create & Join' : 'Log In'}
          </button>
        </form>

        {isNewUser && (
            <button 
              onClick={() => setIsNewUser(false)} 
              className="w-full mt-4 text-xs text-gray-400 hover:text-purple-600 transition"
            >
                Back to Login
            </button>
        )}
      </div>
    </div>
  );
}