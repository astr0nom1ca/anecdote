import { urlFor } from "@/sanity/lib/image";

export default function UpdateCard({ update }: { update: any }) {
  // 1. Extract exactly what we fetched in the GROQ query
  // Notice we use 'image' here, not 'imageUrl'
  const { content, author, feeling, image } = update;

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm relative overflow-hidden mb-4">
      {/* Header: User Info */}
      <div className="flex items-center gap-3 mb-3">
        {/* Use a fallback for the avatar in case it's missing */}
        <div className="w-10 h-10 rounded-full border bg-gray-100 overflow-hidden">
          {author?.avatar && (
            <img 
              src={urlFor(author.avatar).width(100).url()} 
              className="w-full h-full object-cover" 
              alt="" 
            />
          )}
        </div>
        <div>
          <p className="font-bold leading-tight text-black">{author?.name || "Unknown User"}</p>
          <p className="text-sm text-blue-500">@{author?.username || "user"}</p>
        </div>
      </div>

      {/* Content */}
      <p className="text-lg text-gray-800 mb-4">{content}</p>

      {/* 2. Image Display - Fixed Logic */}
      {image?.asset && (
        <div className="relative w-full aspect-[4/3] mb-4 overflow-hidden rounded-lg bg-gray-100">
          <img 
            src={urlFor(image).width(800).auto('format').url()} 
            className="absolute inset-0 w-full h-full object-contain" 
            alt="Status update"
          />
        </div>
      )}

      {/* The "Feeling" Tag - Bottom Right */}
      {feeling && (
        <div 
          className="absolute bottom-3 right-3 px-3 py-1 rounded-full text-white text-sm font-medium flex items-center gap-1 shadow-md"
          style={{ backgroundColor: feeling.color || '#7C4DFF' }}
        >
          <span>Feeling: {feeling.label}</span>
          <span>{feeling.emoji}</span>
        </div>
      )}
    </div>
  );
}