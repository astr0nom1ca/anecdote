import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  
  // Overwrite the cookie with an expired date
  cookieStore.set('locker_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Add this
    sameSite: 'strict',
    expires: new Date(0), // Set to January 1, 1970
    path: '/',
  });

  cookieStore.delete('locker_session'); //

  return NextResponse.json({ message: "Logged out successfully" });
}