import { client } from '@/sanity/lib/client';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // 1. Find the user by email
    const user = await client.fetch(
      `*[_type == "user" && email == $email][0]{ _id }`,
      { email }
    );

    // Security Tip: Even if the email doesn't exist, return a 200 success message.
    // This prevents hackers from "brute-forcing" your API to find registered emails.
    if (!user) {
      return NextResponse.json({ message: "If that email exists, a reset link has been sent." });
    }

    // 2. Generate a secure, random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now

    // 3. Save token and expiry to the user document in Sanity
    await client
      .patch(user._id)
      .set({
        resetToken: resetToken,
        resetTokenExpires: tokenExpiry,
      })
      .commit();

    // 4. Send the Email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    
    console.log(`Reset URL sent to email: ${resetUrl}`); 
    // TODO: Use an email provider like Resend to mail this link to the user!

    return NextResponse.json({ message: "If that email exists, a reset link has been sent." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}