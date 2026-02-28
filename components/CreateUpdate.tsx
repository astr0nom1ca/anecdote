'use client';

import { useState, useEffect } from 'react';
import { client } from '@/sanity/lib/client';

export default function CreateUpdate() {
  const [content, setContent] = useState('');
  const [moods, setMoods] = useState<any[]>([]);
  const [selectedMood, setSelectedMood] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Fetch moods so the user can pick one
  useEffect(() => {
    client.fetch(`*[_type == "mood"]{_id, label, emoji}`).then(setMoods);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file)); // Show a preview to the user
  }
};

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content || !selectedMood) return alert("How are you feeling?");

    setIsSubmitting(true);

    try {
      await client.create({
        _type: 'update',
        content,
        feeling: {
          _type: 'reference',
          _ref: selectedMood,
        },
        // We'll add image logic in a moment!
        author: {
          _type: 'reference',
          _ref: 'YOUR_USER_ID' // For now, hardcode a user ID from your Studio
        }
      });
      
      setContent('');
      window.location.reload(); // Simple way to refresh the feed
    } catch (err) {
      console.error("Post failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm mb-8">
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full border-none focus:ring-0 text-lg resize-none text-black"
          placeholder="What's on your mind?"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {preview && (
  <div className="relative w-full aspect-video mb-4 overflow-hidden rounded-lg">
    <img src={preview} className="w-full h-full object-cover" alt="Preview" />
    <button 
      onClick={() => {setSelectedFile(null); setPreview(null);}}
      className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 w-8 h-8"
    >✕</button>
  </div>
)}

  <div className="flex items-center justify-between mb-4">
    {/* Custom File Upload Button */}
    <label className="cursor-pointer bg-black-100 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition">
      <span>Add Photo</span>
      <input 
        type="file" 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange} 
      />
    </label>
    </div>

        <div className="flex flex-wrap gap-2 my-4">
          {moods.map((mood) => (
            <button
              key={mood._id}
              type="button"
              onClick={() => setSelectedMood(mood._id)}
              className={`px-3 py-1 rounded-full border text-sm transition ${
                selectedMood === mood._id 
                ? 'bg-purple-600 text-white border-purple-600' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {mood.emoji} {mood.label}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-purple-600 text-white font-bold py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
}