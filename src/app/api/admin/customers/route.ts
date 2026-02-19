import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const name = body.name?.trim();
  const phone = body.phone?.trim();
  const bizNo = body.bizNo?.trim().replace(/-/g, "");
  const memo = body.memo?.trim() || null;

  if (!name || !phone || !bizNo) {
    return NextResponse.json(
      { error: "대표자명, 휴대폰, 사업자번호는 필수입니다." },
      { status: 400 }
    );
  }

  const customer = await prisma.customer.create({
    data: { name, phone, bizNo, memo },
  });
  await createAuditLog("customer_created", { customerId: customer.id, name: customer.name });

  return NextResponse.json({ id: customer.id });
}
