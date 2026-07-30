'use client';

import { useState, useEffect } from 'react';
import { client } from '@/sanity/lib/client';
import { useRouter } from 'next/navigation';

export default function CreateUpdate() {
  const [content, setContent] = useState('');
  const [moods, setMoods] = useState<any[]>([]);
  const [selectedMood, setSelectedMood] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  // 🔴 ADDED THESE TWO MISSING HOOKS TO FIX THE RED SQUIGGLES 🔴
  const [isMoodOpen, setIsMoodOpen] = useState(false);
  const [moodSearch, setMoodSearch] = useState('');

  const router = useRouter();

  // To filter moods in real-time based on label search
  const filteredMoods = moods.filter((mood) =>
    mood.label.toLowerCase().includes(moodSearch.toLowerCase())
  );
  
  // To find selected object for button display
  const selectedMoodObj = moods.find((m) => m._id === selectedMood);

  useEffect(() => {
    client.fetch(`*[_type == "mood"]{_id, label, emoji}`).then(setMoods);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.refresh();

    const userId = localStorage.getItem('locker_user_id');

    if (!userId) {
      return alert("Wait! You need to Sign Up or Log In first.");
    }
    if (!content || !selectedMood) {
      return alert("How are you feeling? (Please add text and a mood)");
    }

    setIsSubmitting(true);

    try {
      // Build FormData payload
      const formData = new FormData();
      formData.append('content', content);
      formData.append('moodId', selectedMood);
      formData.append('userId', userId);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      // Call our secure server API route
      const res = await fetch('/api/posts/create', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to post update');
      }

      // Reset state
      setContent('');
      setSelectedFile(null);
      setPreview(null);
      setSelectedMood('');
      setMoodSearch('');
      setIsMoodOpen(false);
      
      window.location.reload(); 
    } catch (err: any) {
      console.error("Post failed:", err);
      alert(err.message || "Something went wrong while posting.");
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
          <div className="relative w-full aspect-video mb-4 overflow-hidden rounded-lg bg-gray-100">
            <img src={preview} className="w-full h-full object-cover" alt="Preview" />
            <button 
              type="button"
              onClick={() => {setSelectedFile(null); setPreview(null);}}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 w-8 h-8 flex items-center justify-center hover:bg-black/70"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <label className="cursor-pointer bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition text-gray-700">
            <span>📷 Add Photo</span>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </label>
        </div>

        <div className="relative my-4 w-full">
          {/* 1. Trigger Button */}
          <button
            type="button"
            onClick={() => setIsMoodOpen(!isMoodOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              {selectedMoodObj ? (
                <>
                  <span>{selectedMoodObj.emoji}</span>
                  <span className="text-gray-900 font-bold">{selectedMoodObj.label}</span>
                </>
              ) : (
                <span className="text-gray-400">What's the vibe?</span>
              )}
            </span>
            
            {/* Chevron Icon */}
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${isMoodOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* 2. Dropdown Menu */}
          {isMoodOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
              {/* Search Bar Input */}
              <div className="p-2 border-b border-gray-100 bg-gray-50/50">
                <input
                  type="text"
                  placeholder="Search moods..."
                  value={moodSearch}
                  onChange={(e) => setMoodSearch(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 text-black placeholder:text-gray-400"
                  autoFocus
                />
              </div>

              {/* Scrollable Mood List */}
              <div className="max-h-56 overflow-y-auto p-1 divide-y divide-gray-50">
                {filteredMoods.length > 0 ? (
                  filteredMoods.map((mood) => {
                    const isSelected = selectedMood === mood._id;
                    return (
                      <button
                        key={mood._id}
                        type="button"
                        onClick={() => {
                          setSelectedMood(mood._id);
                          setIsMoodOpen(false); // Close dropdown on pick
                          setMoodSearch('');    // Reset search
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                          isSelected
                            ? 'bg-purple-50 text-purple-700 font-bold'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-base">{mood.emoji}</span>
                          <span>{mood.label}</span>
                        </span>

                        {/* Selected Checkmark */}
                        {isSelected && (
                          <span className="text-purple-600 font-bold text-xs">✓</span>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="p-3 text-center text-xs text-gray-400">
                    No moods matching "{moodSearch}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-purple-600 text-white font-bold py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition"
        >
          {isSubmitting ? 'Posting to The Locker...' : 'Post'}
        </button>
      </form>
    </div>
  );
}