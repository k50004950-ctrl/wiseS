import { prisma } from "./db";
import { hashToken } from "./token";
import { createAuditLog } from "./audit";

const CONSENT_EXPIRY_HOURS = 72;

export type ConsentStatus =
  | "sent"
  | "opened"
  | "hometax_clicked"
  | "customer_completed"
  | "office_confirmed";

export function getExpiresAt(): Date {
  const d = new Date();
  d.setHours(d.getHours() + CONSENT_EXPIRY_HOURS);
  return d;
}

export async function findConsentByToken(plainToken: string) {
  const tokenHash = hashToken(plainToken);
  return prisma.consentLink.findUnique({
    where: { tokenHash },
    include: { customer: true },
  });
}

export async function markOpened(linkId: string) {
  const link = await prisma.consentLink.update({
    where: { id: linkId },
    data: { status: "opened", openedAt: new Date() },
    include: { customer: true },
  });
  await createAuditLog("consent_opened", { consentLinkId: linkId, customerId: link.customerId });
  return link;
}

export async function markHometaxClicked(linkId: string) {
  const link = await prisma.consentLink.update({
    where: { id: linkId },
    data: { status: "hometax_clicked", hometaxClickedAt: new Date() },
    include: { customer: true },
  });
  await createAuditLog("consent_hometax_clicked", { consentLinkId: linkId, customerId: link.customerId });
  return link;
}

export async function markCustomerCompleted(linkId: string) {
  const link = await prisma.consentLink.update({
    where: { id: linkId },
    data: { status: "customer_completed", customerCompletedAt: new Date() },
    include: { customer: true },
  });
  await createAuditLog("consent_customer_completed", { consentLinkId: linkId, customerId: link.customerId });
  return link;
}

export async function markOfficeConfirmed(linkId: string) {
  const link = await prisma.consentLink.update({
    where: { id: linkId },
    data: { status: "office_confirmed", officeConfirmedAt: new Date() },
    include: { customer: true },
  });
  await createAuditLog("consent_office_confirmed", { consentLinkId: linkId, customerId: link.customerId });
  return link;
}

export function isLinkExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

export function isLinkConsumed(status: ConsentStatus): boolean {
  return status === "office_confirmed";
}
