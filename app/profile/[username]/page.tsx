import { client } from "@/sanity/lib/client";
import UpdateCard from "@/components/UpdateCard";
import UserHeader from "@/components/UserHeader"; // Reuse your header!
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import ProfileIdentity from "@/components/ProfileIdentity";

// 1. The Query: Find the user by username and get their posts
const PROFILE_QUERY = `*[_type == "user" && username == $username][0] {
  _id,
  displayName,
  username,
  realName,
  bio,
  avatar { asset-> }, // 1. Fix for the main Profile Header
  "posts": *[_type == "update" && author._ref == ^._id] | order(_createdAt desc) {
    _id,
    content,
    _createdAt,
    image { asset-> },
    "author": author->{ 
      username, 
      displayName, 
      realName, 
      avatar { asset-> } // 2. Fix for the avatar inside the Feed cards
    },
    "feeling": feeling->{ label, emoji, color }
  }
}`;

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await client.fetch(PROFILE_QUERY, { username });

  // If the user typed a URL that doesn't exist
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-purple-50 p-4 text-black">
        <h1 className="text-4xl font-black text-purple-600 mb-4">404</h1>
        <p className="text-xl font-bold mb-6">Locker not found!</p>
        <Link href="/" className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold">
          Return to Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-50/30 pb-20">
      <div className="max-w-2xl mx-auto p-4">
        {/* Reuse your existing Header at the top */}
        <UserHeader />

        {/* Profile Identity Card */}
        <div className="bg-white border-2 border-purple-100 rounded-3xl p-8 shadow-sm mb-10">
           <div className="flex flex-col items-center text-center">
              {user.avatar ? (
                <img 
                  src={urlFor(user.avatar).width(300).height(300).url()} 
                  className="w-24 h-24 rounded-full border-4 border-purple-500 mb-4 object-cover shadow-lg"
                  alt={user.displayName}
                />
              ) : (
                <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-black mb-4">
                  {user.displayName?.[0].toUpperCase()}
                </div>
              )}
              
              <h1 className="text-3xl font-black text-black leading-tight">
                {user.displayName}
              </h1>
              <p className="text-purple-500 font-bold italic mb-2">@{user.username}</p>
              <p className="text-sm text-gray-400 font-medium mb-6 uppercase tracking-widest">
                Identity: {user.realName}
              </p>

              {user.bio ? (
                <p className="text-gray-600 leading-relaxed max-w-md italic border-t pt-4">
                  "{user.bio}"
                </p>
              ) : (
                <p className="text-gray-300 italic border-t pt-4">No bio yet...</p>
              )}
              <ProfileIdentity user={user} />
           </div>
        </div>

        {/* The User's specific Archive */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-4">
             <div className="h-[2px] bg-purple-100 flex-grow"></div>
             <h2 className="text-xs font-black text-purple-300 uppercase tracking-[0.3em]">
               The Archive
             </h2>
             <div className="h-[2px] bg-purple-100 flex-grow"></div>
          </div>

          {user.posts?.length > 0 ? (
            user.posts.map((post: any) => (
              <UpdateCard key={post._id} update={post} />
            ))
          ) : (
            <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-purple-100">
               <p className="text-gray-400 font-medium">This locker is currently empty.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}