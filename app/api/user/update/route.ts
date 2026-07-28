import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';
import { revalidatePath } from 'next/cache';

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const userId = formData.get('userId') as string;
    const displayName = formData.get('displayName') as string;
    const bio = formData.get('bio') as string;
    const imageFile = formData.get('image') as File | null;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    let imageAsset = null;

    // Upload new image asset if provided
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      imageAsset = await writeClient.assets.upload('image', buffer, {
        contentType: imageFile.type,
        filename: imageFile.name,
      });
    }

    // Build patch payload
    const setPayload: Record<string, any> = {
      displayName,
      bio,
    };

    if (imageAsset) {
      setPayload.avatar = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageAsset._id,
        },
      };
    }

    // Apply patch
    await writeClient.patch(userId).set(setPayload).commit();

    // Revalidate feed/profile paths
    revalidatePath('/');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error updating profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}