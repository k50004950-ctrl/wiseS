import { NextRequest, NextResponse } from "next/server";
import {
  findConsentByToken,
  markCustomerCompleted,
  isLinkExpired,
  isLinkConsumed,
} from "@/lib/consent";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const token = form.get("token")?.toString();
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const link = await findConsentByToken(token);
  if (!link || isLinkExpired(link.expiresAt) || isLinkConsumed(link.status as "office_confirmed")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (link.status === "opened" || link.status === "hometax_clicked") {
    await markCustomerCompleted(link.id);
  }

  return NextResponse.redirect(new URL(`/consent/${encodeURIComponent(token)}/thank-you`, request.url));
}
