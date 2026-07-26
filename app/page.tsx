import { client } from "@/sanity/lib/client";
import UpdateCard from "@/components/UpdateCard";
import CreateUpdate from "@/components/CreateUpdate";
import AuthGuard from "@/components/AuthGuard";
import UserHeader from "@/components/UserHeader";

const FEED_QUERY = `*[_type == "update"] | order(_createdAt desc) {
  _id,
  content,
  _createdAt,
  image {
    asset->,
    hotspot,
    crop
  },
  "author": {
    "_id": author->_id,
    "username": coalesce(author->username, "deleted_user"),
    "displayName": coalesce(author->displayName, author->realName, "[Deleted User]"),
    "realName": author->realName,
    "avatar": author->avatar { asset-> }
  },
  "feeling": feeling->{
    label,
    emoji,
    color
  }
}`;

export default async function HomePage() {
  const updates = await client.fetch(FEED_QUERY);

  return (
    <AuthGuard>
      <main className="max-w-2xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8 text-purple-600 uppercase italic tracking-tighter">
          The Locker
        </h1>
        <UserHeader />

        <CreateUpdate />
        
        <div className="flex flex-col gap-6">
          {updates.map((update: any) => (
            <UpdateCard key={update._id} update={update} />
          ))}
          
          {updates.length === 0 && (
            <p className="text-center text-gray-500">No updates yet. How are you feeling?</p>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}