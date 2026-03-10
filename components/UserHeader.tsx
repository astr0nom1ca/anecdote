'use client';

import { useState, useEffect } from 'react';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import Link from 'next/link';

export default function UserHeader() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userId = localStorage.getItem('locker_user_id');
    if (userId) {
      client.fetch(`*[_id == "${userId}"][0]{
        username, 
        displayName, 
        realName, 
        avatar { asset-> }
      }`).then(setUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('locker_user_id');
    window.location.reload(); 
  };

  if (!user) return null;

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-xl border mb-6 shadow-sm border-purple-100">
      {/* Clicking anywhere in this section now takes you to your profile */}
      <Link 
        href={`/profile/${user.username}`} 
        className="flex items-center gap-3 hover:opacity-80 transition group"
      >
        {/* Avatar */}
        {user.avatar ? (
          <img 
            src={urlFor(user.avatar).width(100).height(100).url()} 
            className="w-12 h-12 rounded-full object-cover border-2 border-purple-500 shadow-sm"
            alt={user.displayName || user.username}
          />
        ) : (
          <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-black text-xl shadow-inner">
            {(user.displayName || user.username)[0].toUpperCase()}
          </div>
        )}

        {/* Identity Info */}
        <div className="flex flex-col">
          <span className="font-black text-black text-lg leading-tight group-hover:text-purple-600 transition-colors">
            {user.displayName || user.username} 
          </span>
          
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="text-purple-500 italic">@{user.username}</span>
            {user.realName && (
              <span className="text-gray-400 border-l pl-2 border-gray-200">
                {user.realName}
              </span>
            )}
          </div>
        </div>
      </Link>

      <button 
        onClick={handleLogout}
        className="text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-all uppercase tracking-widest"
      >
        Log Out
      </button>
    </div>
  );
}