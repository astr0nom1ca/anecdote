import { client } from '@/sanity/lib/client';
import { hashPassword } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    // 1. Locate the user who owns this specific token, ensuring it hasn't expired yet
    const user = await client.fetch(
      `*[_type == "user" && resetToken == $token && resetTokenExpiry > $now][0]{ _id }`,
      { token, now: new Date().toISOString() }
    );

    if (!user) {
      return NextResponse.json({ error: "The recovery token is invalid or has expired." }, { status: 400 });
    }

    // 2. Hash their new password securely using your auth utility
    const hashedPassword = await hashPassword(newPassword);

    // 3. Update the password field and completely wipe the reset tokens so they can't be reused
    await client
      .patch(user._id)
      .set({ password: hashedPassword })
      .unset(['resetToken', 'resetTokenExpiry'])
      .commit();

    return NextResponse.json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ error: "Failed to update password." }, { status: 500 });
  }
}