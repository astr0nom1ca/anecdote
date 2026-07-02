import { client } from '@/sanity/lib/client';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { Resend } from 'resend';

// Initialize Resend with your environment token
const resend = new Resend(process.env.EMAIL_SERVICE_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // 1. Find the user by their email string
    const user = await client.fetch(
      `*[_type == "user" && email == $email][0]{ _id }`,
      { email }
    );

    // Security practice: Always tell the user the email was sent, even if it doesn't exist.
    // This stops hackers from probing your database to see who has an account.
    if (!user) {
      return NextResponse.json({ message: "If that email exists, a reset link has been sent!" });
    }

    // 2. Generate a secure, 32-character random hex token
    const resetToken = crypto.randomBytes(16).toString('hex');
    const tokenExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour expiration window

    // 3. Save the token and expiration timestamp to their Sanity user document
    await client
      .patch(user._id)
      .set({
        resetToken: resetToken,
        resetTokenExpiry: tokenExpiry, // Matching your schema naming convention!
      })
      .commit();

    // 4. Build the recovery URL pointing directly to your new folder structure
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/signup/forgot?token=${resetToken}`;
    
    // 5. Fire off the email transaction via Resend
    await resend.emails.send({
      from: 'The Locker <onboarding@resend.dev>', // Resend lets you use this domain for testing on localhost
      to: email,
      subject: 'Reset Your Locker Password',
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; border: 2px solid #e9d5ff; border-radius: 16px;">
          <h2 style="color: #9333ea; font-style: italic;">The Locker</h2>
          <p style="color: #6b7280; font-weight: 500;">Lost your key? No worries. Click the link below to set up a brand new secure password:</p>
          <a href="${resetUrl}" style="background: #9333ea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block; margin: 15px 0; text-transform: uppercase; font-size: 14px;">
            Reset Password
          </a>
          <p style="color: #9ca3af; font-size: 11px; margin-top: 20px;">This link will automatically expire in 1 hour. If you did not make this request, you can safely ignore this email.</p>
        </div>
      `
    });

    return NextResponse.json({ message: "If that email exists, a reset link has been sent!" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ error: "Something went wrong on our end." }, { status: 500 });
  }
}