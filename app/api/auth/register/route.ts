import { client } from '@/sanity/lib/client';
import { hashPassword, createToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { username, displayName, password, email } = await request.json();

    // 1. Check if user already exists
    const existingUser = await client.fetch(
      `*[_type == "user" && (username == $username || email == $email)][0]`,
      { username, email }
    );

    if (existingUser) {
      return NextResponse.json({ error: "Username or Email already taken" }, { status: 400 });
    }

    // 2. Hash the password
    const hashedPassword = await hashPassword(password);

    // 3. Create the user in Sanity
    const newUser = await client.create({
      _type: 'user',
      username: username.toLowerCase(),
      displayName,
      email,
      password: hashedPassword, // Store the scrambled version!
    });

    // 4. Create a Session Token (The ID Card)
    const token = await createToken({ userId: newUser._id, username: newUser.username });

    // 5. Set a Secure Cookie
    const cookieStore = await cookies();
    cookieStore.set('locker_session', token, {
      httpOnly: true, // Prevents JavaScript from stealing the token
      secure: process.env.NODE_NODE === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return NextResponse.json({ message: "Account created!" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}