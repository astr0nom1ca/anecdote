import { client } from '@/sanity/lib/client';
import { createToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    // 1. Fetch the user (Supporting both 'password' and 'passwordHash' naming formats)
    const user = await client.fetch(
      `*[_type == "user" && username == $username][0]{
        _id,
        username,
        email,
        password,
        passwordHash
      }`,
      { username: username.toLowerCase().trim() }
    );

    // Identify which field holds your hashed password
    const storedHash = user?.passwordHash || user?.password;

    // 2. Check if user exists and password matches
    if (!user || !storedHash || !(await bcrypt.compare(password, storedHash))) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    // 3. Create Session Token (Now securely including email!)
    const token = await createToken({ 
      userId: user._id, 
      username: user.username,
      email: user.email
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

    // Return the userId to the frontend so it can save to localStorage
    return NextResponse.json({ 
      message: "Welcome back!",
      userId: user._id 
    }, { status: 200 });

  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}