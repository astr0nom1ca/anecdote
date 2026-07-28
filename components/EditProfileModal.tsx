'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditProfileModal({
  user,
  onOpenChange,
}: {
  user: any;
  onOpenChange: (open: boolean) => void;
}) {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [bio, setBio] = useState(user.bio || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('userId', user._id);
      formData.append('displayName', displayName);
      formData.append('bio', bio);

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await fetch('/api/user/update', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      router.refresh();
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to update profile!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-black text-purple-600 uppercase italic mb-6">
          Customize Your Locker
        </h2>

        <div className="space-y-4">
          {/* Image Upload Section */}
          <div className="flex flex-col items-center mb-4">
            <div className="w-20 h-20 bg-purple-100 rounded-full mb-3 overflow-hidden border-2 border-purple-500 flex items-center justify-center">
              {preview ? (
                <img src={preview} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-purple-400 font-bold text-xs text-center p-2">
                  New Photo
                </div>
              )}
            </div>
            <label className="cursor-pointer bg-purple-50 text-purple-600 text-[10px] font-black uppercase px-4 py-2 rounded-lg hover:bg-purple-100 transition">
              Choose Image
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          </div>

          <div>
            <label className="text-xs font-black uppercase text-gray-400 ml-1">
              Wacky Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-3 bg-purple-50 border-2 border-purple-100 rounded-xl focus:border-purple-500 outline-none text-black font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase text-gray-400 ml-1">
              Your Bio
            </label>
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
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 py-3 font-bold text-gray-400 hover:text-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="button"
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