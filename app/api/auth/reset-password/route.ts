import { client } from '@/sanity/lib/client';
import { hashPassword } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    // 1. Find user with this token where the token hasn't expired yet
    const user = await client.fetch(
      `*[_type == "user" && resetToken == $token && resetTokenExpires > $now][0]{ _id }`,
      { token, now: new Date().toISOString() }
    );

    if (!user) {
      return NextResponse.json({ error: "Token is invalid or has expired." }, { status: 400 });
    }

    // 2. Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // 3. Update password and wipe out the reset token fields so they can't be reused
    await client
      .patch(user._id)
      .set({ password: hashedPassword })
      .unset(['resetToken', 'resetTokenExpires']) // Remove these fields
      .commit();

    return NextResponse.json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}