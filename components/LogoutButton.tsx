'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        // Clear any client-side cache and bounce to signup
        router.push('/signup');
        router.refresh();
      }
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors border border-red-100"
    >
      Log Out
    </button>
  );
}