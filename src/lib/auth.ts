import { SignJWT, jwtVerify } from 'jose';

// Secret key should ideally come from env, but for now we hardcode a fallback if not provided
const getSecret = (env: any) => new TextEncoder().encode(env?.JWT_SECRET || 'darsni-super-secret-key-for-jwt-2024');

export async function createSession(userId: string, role: string, env: any) {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getSecret(env));
  
  return token;
}

export async function verifySession(token: string, env: any) {
  try {
    const { payload } = await jwtVerify(token, getSecret(env));
    return payload as { userId: string, role: string };
  } catch (err) {
    return null;
  }
}
