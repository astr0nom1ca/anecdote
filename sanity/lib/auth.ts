import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-this');

// 1. Turn "Password123" into scrambled eggs
export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 12);
}

// 2. Create a "Member Card" (JWT) that expires in 7 days
export async function createToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);
}

// 3. Check if a "Member Card" is real or fake
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}