'use client';

import { useState } from 'react';
import { client } from '@/sanity/lib/client';

export default function EditProfileModal({ user, onOpenChange }: { user: any, onOpenChange: (open: boolean) => void }) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await client
        .patch(user._id) // Use the user's Sanity ID
        .set({ displayName, bio })
        .commit();
      
      window.location.reload(); // Refresh to show new data
    } catch (err) {
      console.error(err);
      alert("Failed to update profile!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-black text-purple-600 uppercase italic mb-6">Customize Your Locker</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-black uppercase text-gray-400 ml-1">Wacky Display Name</label>
            <input 
              type="text" 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-3 bg-purple-50 border-2 border-purple-100 rounded-xl focus:border-purple-500 outline-none text-black font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase text-gray-400 ml-1">Your Bio</label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full p-3 bg-purple-50 border-2 border-purple-100 rounded-xl focus:border-purple-500 outline-none text-black"
              placeholder="What's your story?"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              onClick={() => onOpenChange(false)}
              className="flex-1 py-3 font-bold text-gray-400 hover:text-gray-600 transition"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-purple-600 text-white font-black py-3 rounded-xl hover:bg-purple-700 transition disabled:bg-gray-300"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}