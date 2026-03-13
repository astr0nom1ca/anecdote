import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  
  // Overwrite the cookie with an expired date
  cookieStore.set('locker_session', '', {
    httpOnly: true,
    expires: new Date(0), // Set to January 1, 1970
    path: '/',
  });

  return NextResponse.json({ message: "Logged out successfully" });
}