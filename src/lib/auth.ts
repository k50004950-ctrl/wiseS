import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

const SESSION_COOKIE = "wise_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createAdminSession(email: string): Promise<string> {
  const secret = process.env.ADMIN_SESSION_SECRET || "dev-secret";
  const payload = JSON.stringify({ email, exp: Date.now() + SESSION_MAX_AGE * 1000 });
  const signature = await hashPassword(payload + secret);
  const session = Buffer.from(JSON.stringify({ payload, signature })).toString("base64url");
  return session;
}

export async function getAdminSession(): Promise<{ email: string } | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const { payload, signature } = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf8")
    ) as { payload: string; signature: string };
    const secret = process.env.ADMIN_SESSION_SECRET || "dev-secret";
    const valid = await verifyPassword(payload + secret, signature);
    if (!valid) return null;
    const data = JSON.parse(payload) as { email: string; exp: number };
    if (Date.now() > data.exp) return null;
    const user = await prisma.adminUser.findUnique({ where: { email: data.email } });
    return user ? { email: user.email } : null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(session: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
