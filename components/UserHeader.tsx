'use client';

import { useState, useEffect, useCallback } from 'react';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import Link from 'next/link';

export default function UserHeader() {
  const [user, setUser] = useState<any>(null);
  const [updatedAt, setUpdatedAt] = useState<number>(Date.now());

  const fetchUserData = useCallback(() => {
    const userId = localStorage.getItem('locker_user_id');
    if (userId) {
      // { useCdn: false } forces Sanity to fetch live data from the origin store
      client
        .fetch(
          `*[_id == $userId][0]{
            username, 
            displayName, 
            realName, 
            avatar { asset-> }
          }`,
          { userId },
          { useCdn: false, cache: 'no-store' } // 👈 Bypasses Sanity CDN cache
        )
        .then((data) => {
          setUser(data);
          setUpdatedAt(Date.now()); // 👈 Triggers fresh image loading
        })
        .catch(console.error);
    }
  }, []);

  useEffect(() => {
    fetchUserData();

    const handleProfileUpdate = () => {
      fetchUserData();
    };

    window.addEventListener('locker_profile_updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('locker_profile_updated', handleProfileUpdate);
    };
  }, [fetchUserData]);

  const handleLogout = () => {
    // 1. Clear local storage user key
    localStorage.removeItem('locker_user_id');

    // 2. Redirect to home page (or login) instead of just reloading the current page
    window.location.href = '/'; 
  };

  if (!user) return null;

  // Build image URL with a cache-busting query param
  const avatarUrl = user.avatar?.asset?._ref || user.avatar?.asset?._id
    ? `${urlFor(user.avatar).width(100).height(100).url()}&t=${updatedAt}`
    : null;

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-xl border mb-6 shadow-sm border-purple-100">
      <Link
        href={`/profile/${user.username}`}
        className="flex items-center gap-3 hover:opacity-80 transition group"
      >
        {/* Avatar */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            className="w-12 h-12 rounded-full object-cover border-2 border-purple-500 shadow-sm"
            alt={user.displayName || user.username}
          />
        ) : (
          <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-black text-xl shadow-inner">
            {(user.displayName || user.username)[0]?.toUpperCase()}
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