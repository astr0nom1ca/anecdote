'use client';

import { useState, useEffect } from 'react';
import EditProfileModal from './EditProfileModal';

export default function ProfileIdentity({ user }: { user: any }) {
  const [isOwner, setIsOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loggedInId = localStorage.getItem('locker_user_id');
    if (loggedInId === user._id) {
      setIsOwner(true);
    }
  }, [user._id]);

  return (
    <>
      {isOwner && (
        <button 
          onClick={() => setIsEditing(true)}
          className="mt-4 text-xs font-black text-purple-500 border-2 border-purple-500 px-4 py-1 rounded-full hover:bg-purple-500 hover:text-white transition uppercase tracking-tighter"
        >
          Edit Locker
        </button>
      )}

      {isEditing && (
        <EditProfileModal user={user} onOpenChange={setIsEditing} />
      )}
    </>
  );
}