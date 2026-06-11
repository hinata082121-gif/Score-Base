import { getPrisma } from "@/lib/db/prisma";

type AuditInput = {
  userId?: string | null;
  teamId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  detail?: string | null;
};

function safeDetail(value?: string | null) {
  if (!value) return null;
  return value.slice(0, 500);
}

export async function recordAuditLog(input: AuditInput) {
  try {
    const prisma = await getPrisma();
    await prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        teamId: input.teamId ?? null,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId ?? null,
        detail: safeDetail(input.detail),
      },
    });
  } catch {
    // Audit logging must not block the primary user action.
  }
}
