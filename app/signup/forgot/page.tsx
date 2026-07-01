'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Detect if a reset token is present in the URL bar (?token=XYZ)
  const token = searchParams.get('token');

  // Input & UI States matching your layout style
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // 📨 Handlers 
  const handleRequestLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setMessage(data.message);
    } catch (err: any) {
      setError(err.message || 'Check your connection!');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      
      setMessage('Password updated! Redirecting...');
      setTimeout(() => {
        router.push('/signup'); // Direct back to your main Auth page
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Reset failed.');
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
          {token ? "Create your new secure key" : "Recover your lost access token"}
        </p>
        
        {token ? (
          /* --- VIEW A: RESET PASSWORD --- */
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-xs text-purple-500 mb-1 font-bold ml-1">Type your new password:</p>
              <input 
                type="password" 
                placeholder="New Password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border-2 border-purple-100 bg-purple-50/50 rounded-xl focus:border-purple-500 outline-none text-black font-medium"
                required
                minLength={6}
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : 'Update Password'}
            </button>
          </form>
        ) : (
          /* --- VIEW B: FORGOT PASSWORD REQUEST --- */
          <form onSubmit={handleRequestLink} className="space-y-4">
            <div>
              <input 
                type="email" 
                placeholder="Account Email (e.g. joe@gmail.com)" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-purple-500 outline-none text-black font-medium"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : 'Send Recovery Link'}
            </button>
          </form>
        )}

        {/* Unified Feedback Microcopy matching the design style */}
        {message && (
          <div className="mt-4 p-3 bg-purple-50 border border-purple-200 text-purple-700 rounded-xl text-xs font-bold text-center animate-in fade-in">
            {message}
          </div>
        )}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold text-center animate-in fade-in">
            {error}
          </div>
        )}

        <button 
          onClick={() => router.push('/signup')} 
          className="w-full mt-6 text-xs text-gray-400 hover:text-purple-600 transition text-center block"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}