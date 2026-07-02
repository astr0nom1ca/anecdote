import { client } from '@/sanity/lib/client';
import { hashPassword, createToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { username, displayName, password, email } = await request.json();

    // 1. Edge-case Sanitization (The Safety Net)
    const cleanUsername = username.toLowerCase().trim();
    const cleanEmail = email.toLowerCase().trim(); // 👈 Strips spaces and forces lowercase

    // 2. Check if user already exists (Updated to use clean sanitized variables)
    const existingUser = await client.fetch(
      `*[_type == "user" && (username == $username || email == $email)][0]`,
      { username: cleanUsername, email: cleanEmail }
    );

    if (existingUser) {
      // 💡 Pro Skill: Tell the user exactly what went wrong instead of a generic guess
      const isDuplicateEmail = existingUser.email === cleanEmail;
      return NextResponse.json({ 
        error: isDuplicateEmail ? "Email is already registered" : "Username is already taken" 
      }, { status: 400 });
    }

    // 3. Hash the password
    const hashedPassword = await hashPassword(password);

    // 4. Create the user in Sanity
    const newUser = await client.create({
      _type: 'user',
      username: cleanUsername,
      displayName,
      email: cleanEmail, // 👈 Saves the pristine sanitized email string
      password: hashedPassword,
    });

    // 5. Create a Session Token (Passing the email down here too!)
    const token = await createToken({ 
      userId: newUser._id, 
      username: newUser.username,
      email: newUser.email // 👈 Match the new login payload structure!
    });

    // 6. Set a Secure Cookie
    const cookieStore = await cookies();
    cookieStore.set('locker_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return NextResponse.json({ message: "Account created!" }, { status: 201 });
  } catch (error) {
    console.error("Registration route error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}