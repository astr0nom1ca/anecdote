'use client';

import { useState } from 'react';
import { client } from '@/sanity/lib/client';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(''); //  ADDED EMAIL STATE VARIABLE HERE
  const [name, setName] = useState(''); 
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);

      const cleanUsername = username.toLowerCase().trim();
      const cleanEmail = email.toLowerCase().trim();

      try {
        if (!isNewUser) {
          // --- 1. LOGIN FLOW ---
          // First check if user exists in Sanity
          const existingUser = await client.fetch(
            `*[_type == "user" && username == $username][0]`, 
            { username: cleanUsername }
          );

          if (!existingUser) {
            // If user doesn't exist, automatically prompt them to sign up
            setIsNewUser(true);
            setLoading(false);
            return;
          }

          // Save local session tracker & redirect
          localStorage.setItem('locker_user_id', existingUser._id);
          router.push('/');

        } else {
          // --- 2. SIGNUP FLOW (Talks to your register API route) ---
          const response = await fetch('/api/register', { // 👈 Make sure this matches your actual API path (e.g., /api/register)
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: cleanUsername,
              displayName: name || cleanUsername, // Maps "realName" state to the route's expected "displayName"
              email: cleanEmail,
              password: "temporary-secure-password" // ⚠️ Add a password field to your form later, or pass a placeholder for now
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Registration failed");
          }

          // Success! Set local storage identifier and redirect
          // (The secure HTTP-only cookie was already set by the server response!)
          router.push('/');
        }
      } catch (err: any) {
        console.error(err);
        alert(err.message || "Something went wrong. Check your connection!");
      } finally {
        setLoading(false);
      }
    };

return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white p-8 rounded-2xl shadow-xl border-2 border-purple-200">
        <h1 className="text-3xl font-black text-purple-600 mb-2 text-center uppercase tracking-tighter italic">
          anecdote
        </h1>
        <p className="text-gray-500 text-center mb-8 font-medium">
          {isNewUser ? "Finish creating your account" : "Sign in with your username"}
        </p>
        
        <form onSubmit={handleAuth} className="space-y-4">
          
          {/* USERNAME INPUT (Visible during Login & Signup) */}
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
          </div>

          {/* FORGOT PASSWORD LINK (Only shows up during Login state) */}
          {!isNewUser && (
            <div className="flex justify-end pr-1">
              <button
                type="button"
                onClick={() => router.push('/signup/forgot')}
                className="text-xs font-semibold text-purple-400 hover:text-purple-600 transition"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* SIGNUP EXTRA FIELDS (Animate open when it is a brand new account) */}
          {isNewUser && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-xs text-purple-500 font-bold ml-1">Username available! Provide details:</p>
              
              {/* EMAIL INPUT */}
              <input 
                type="email"
                placeholder="your-email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase().trim())} 
                className="w-full p-3 border-2 border-purple-100 bg-purple-50/50 rounded-xl focus:border-purple-500 outline-none text-black font-medium"
                required
              />

              {/* REAL NAME INPUT */}
              <input 
                type="text" 
                placeholder="Real Name (e.g. Andre Harris)" 
                value={name}
                className="w-full p-3 border-2 border-purple-100 bg-purple-50/50 rounded-xl focus:border-purple-500 outline-none text-black font-medium"
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          {/* SUBMIT ACTION BUTTON */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : isNewUser ? 'Create & Join' : 'Log In'}
          </button>
        </form>

        {/* 🌟 DYNAMIC UTILITY TOGGLE FOOTER */}
        <div className="mt-6 text-center">
          {isNewUser ? (
            <p className="text-xs text-gray-400 font-medium">
              Already have a secure key?{' '}
              <button 
                onClick={() => setIsNewUser(false)} 
                className="font-bold text-purple-500 hover:text-purple-700 transition underline decoration-2 underline-offset-2"
              >
                Log In
              </button>
            </p>
          ) : (
            <p className="text-xs text-gray-400 font-medium">
              New around here?{' '}
              <button 
                onClick={() => setIsNewUser(true)} 
                className="font-bold text-purple-500 hover:text-purple-700 transition underline decoration-2 underline-offset-2"
              >
                Create an Account
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}