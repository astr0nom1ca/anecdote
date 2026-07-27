import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';

// Instantiate a write-enabled Sanity client on the server
const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN, // 👈 Require write token in .env.local
  useCdn: false,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const content = formData.get('content') as string;
    const moodId = formData.get('moodId') as string;
    const userId = formData.get('userId') as string;
    const file = formData.get('file') as File | null;

    if (!userId || !content || !moodId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let imageAsset = null;

    // Upload image using the writeClient
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      imageAsset = await writeClient.assets.upload('image', buffer, {
        contentType: file.type,
        filename: file.name,
      });
    }

    // Create the update document
    const newUpdate = await writeClient.create({
      _type: 'update',
      content,
      feeling: {
        _type: 'reference',
        _ref: moodId,
      },
      image: imageAsset
        ? {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: imageAsset._id,
            },
          }
        : undefined,
      author: {
        _type: 'reference',
        _ref: userId,
        _weak: true, // 👈 Keeps weak reference intact!
      },
    });

    return NextResponse.json({ success: true, update: newUpdate });
  } catch (error: any) {
    console.error('API Error creating update:', error);
    return NextResponse.json({ error: error.message || 'Failed to post' }, { status: 500 });
  }
}