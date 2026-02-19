import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { markOfficeConfirmed } from "@/lib/consent";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const linkId = body.linkId;
  if (!linkId) {
    return NextResponse.json({ error: "linkId 필요" }, { status: 400 });
  }

  const link = await prisma.consentLink.findUnique({ where: { id: linkId } });
  if (!link) {
    return NextResponse.json({ error: "링크를 찾을 수 없습니다." }, { status: 404 });
  }
  if (link.status !== "customer_completed") {
    return NextResponse.json({ error: "고객 완료 상태에서만 확정할 수 있습니다." }, { status: 400 });
  }

  await markOfficeConfirmed(link.id);
  return NextResponse.json({ ok: true });
}
