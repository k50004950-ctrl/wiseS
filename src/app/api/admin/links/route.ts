import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateToken, hashToken } from "@/lib/token";
import { getExpiresAt } from "@/lib/consent";
import { createAuditLog } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const customerId = body.customerId;
  if (!customerId) {
    return NextResponse.json({ error: "customerId 필요" }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    return NextResponse.json({ error: "고객을 찾을 수 없습니다." }, { status: 404 });
  }

  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = getExpiresAt();

  const link = await prisma.consentLink.create({
    data: { customerId, tokenHash, expiresAt, status: "sent" },
  });

  await createAuditLog("consent_link_created", {
    consentLinkId: link.id,
    customerId: customer.id,
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const fullUrl = `${baseUrl}/consent/${token}`;

  return NextResponse.json({ linkId: link.id, token, fullUrl });
}
