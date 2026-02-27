import { client } from "@/sanity/lib/client";
import UpdateCard from "@/components/UpdateCard";
import CreateUpdate from "@/components/CreateUpdate";

const FEED_QUERY = `*[_type == "update"] | order(_createdAt desc) {
  _id,
  content,
  _createdAt,
  // 1. Fetch the full image object so urlFor() can process it
  image {
    asset->,
    hotspot,
    crop
  },
  // 2. Expand the author and their avatar
  "author": author->{
    name,
    username,
    avatar {
      asset->
    }
  },
  // 3. Expand the feeling to get the label, emoji, and color
  "feeling": feeling->{
    label,
    emoji,
    color
  }
}`;

export default async function HomePage() {
  const updates = await client.fetch(FEED_QUERY);

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-purple-600">The Locker</h1>

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
  );
}