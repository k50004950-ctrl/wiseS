import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { verifyPassword, createAdminSession } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { rateLimit, getClientKey } from "@/lib/rate-limit";

const SESSION_COOKIE = "wise_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const DEFAULT_EMAIL = "admin@wise-tax.kr";
const DEFAULT_PASSWORD = "admin123!";

export async function POST(request: NextRequest) {
  const key = getClientKey(request.headers);
  const { ok } = rateLimit(`admin-login:${key}`);
  if (!ok) {
    return NextResponse.json({ error: "요청이 너무 많습니다." }, { status: 429 });
  }

  const form = await request.formData();
  const email = form.get("email")?.toString()?.trim();
  const password = form.get("password")?.toString();
  if (!email || !password) {
    return NextResponse.json({ error: "이메일과 비밀번호를 입력해 주세요." }, { status: 400 });
  }

  let user: Awaited<ReturnType<typeof prisma.adminUser.findUnique>> = null;
  try {
    user = await prisma.adminUser.findUnique({ where: { email } });
  } catch (e) {
    return NextResponse.json(
      { error: "DB가 준비되지 않았습니다. 터미널에서 npm run setup 실행 후 다시 시도하세요." },
      { status: 503 }
    );
  }

  // 로컬 개발: 관리자 계정이 없고 기본 계정으로 로그인 시도 시 자동 생성
  if (!user && process.env.NODE_ENV === "development" && email === DEFAULT_EMAIL && password === DEFAULT_PASSWORD) {
    try {
      user = await prisma.adminUser.create({
        data: {
          email: DEFAULT_EMAIL,
          passwordHash: await bcrypt.hash(DEFAULT_PASSWORD, 12),
        },
      });
    } catch (e) {
      return NextResponse.json(
        { error: "DB 테이블이 없습니다. 터미널에서 npm run setup 실행 후 다시 시도하세요." },
        { status: 503 }
      );
    }
  }

  if (!user) {
    return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const session = await createAdminSession(user.email);
  await createAuditLog("admin_login", { email: user.email });

  // 쿠키를 반환하는 Response에 직접 붙여야 브라우저에 전달됨
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return response;
}
