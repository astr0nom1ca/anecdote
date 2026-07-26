'use client';

import { useState, useEffect } from 'react';
import { urlFor } from '@/sanity/lib/image';
import { client } from '@/sanity/lib/client';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function UpdateCard({ update }: { update: any }) {
  const { _id, content, _createdAt, image, author, feeling } = update;
  const [isOwner, setIsOwner] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Check if the current viewer is the person who wrote the post
    const currentUserId = localStorage.getItem('locker_user_id');
    if (currentUserId && author?._id === currentUserId) {
      setIsOwner(true);
    }
  }, [author]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to scrap this update?")) return;

    setIsDeleting(true);
    try {
      await client.delete(_id);
      window.location.reload(); // Refresh to show it's gone
    } catch (err) {
      console.error(err);
      alert("Delete failed. Are your Sanity permissions set to 'Editor'?");
      setIsDeleting(false);
    }
  };

  return (
    <div className={`bg-white border border-purple-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all ${isDeleting ? 'opacity-50 grayscale' : ''}`}>
      {/* Header Area */}
      <div className="flex items-center justify-between mb-4">
        <Link href={`/profile/${author?.username}`} className="flex items-center gap-3 group">
          {/* Avatar */}
          {author?.avatar ? (
            <img 
              src={urlFor(author.avatar).width(80).height(80).url()} 
              className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
              alt={author.displayName || author.username}
            />
          ) : (
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
              {(author?.displayName || author?.username || 'U')[0].toUpperCase()}
            </div>
          )}

          {/* Triple Identity Header */}
          <div className="flex flex-col">
            <span className="font-black text-black leading-tight group-hover:text-purple-600 transition-colors">
              {author?.displayName || author?.username}
            </span>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs">
              <span className="text-purple-500 italic font-medium">@{author?.username}</span>
              {author?.realName && (
                <span className="text-gray-400 border-l pl-2 border-gray-200">
                  {author?.realName}
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Timestamp & Mood */}
        <div className="text-right flex flex-col items-end">
          {feeling && (
            <div 
              className="text-xs font-bold px-2 py-1 rounded-full border inline-block mb-1"
              style={{ borderColor: feeling.color, color: feeling.color, backgroundColor: `${feeling.color}10` }}
            >
              {feeling.emoji} {feeling.label}
            </div>
          )}
          <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
            {formatDistanceToNow(new Date(_createdAt))} ago
          </p>
          
          {/* The Delete Button - Only visible to the owner */}
          {isOwner && (
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="mt-2 text-[10px] font-bold text-red-300 hover:text-red-600 transition-colors uppercase tracking-tighter"
            >
              {isDeleting ? 'Removing...' : '[ Delete ]'}
            </button>
          )}
        </div>
      </div>

      {/* Post Content */}
      <p className="text-gray-800 text-lg leading-relaxed mb-4 whitespace-pre-wrap">
        {content}
      </p>

      {/* Attached Image */}
      {image && (
        <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center max-h-72">
          <img 
            src={urlFor(image).width(800).url()} 
            className="w-full max-h-72 object-contain"
            alt="Post attachment"
          />
        </div>
      )}
    </div>
  );
}