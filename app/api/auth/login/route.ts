import { client } from '@/sanity/lib/client';
import { createToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // 1. Fetch the user (Added 'email' to the GROQ projection)
    const user = await client.fetch(
      `*[_type == "user" && username == $username][0]{
        _id,
        username,
        email,       // 👈 Fetching email from Sanity
        password
      }`,
      { username: username.toLowerCase().trim() }
    );

    // 2. Check if user exists and password is correct
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    // 3. Create Session Token (Including email in the session token payload)
    const token = await createToken({ 
      userId: user._id, 
      username: user.username,
      email: user.email // 👈 Now your session token securely knows their email!
    });

    // 4. Set Secure Cookie
    const cookieStore = await cookies();
    cookieStore.set('locker_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return NextResponse.json({ message: "Welcome back!" }, { status: 200 });
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}