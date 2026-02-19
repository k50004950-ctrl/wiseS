import { prisma } from "./db";

export type AuditAction =
  | "consent_link_created"
  | "consent_opened"
  | "consent_hometax_clicked"
  | "consent_customer_completed"
  | "consent_office_confirmed"
  | "admin_login"
  | "customer_created";

export async function createAuditLog(
  action: AuditAction,
  meta?: Record<string, unknown>
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      action,
      metaJson: meta ? JSON.stringify(meta) : null,
    },
  });
}
