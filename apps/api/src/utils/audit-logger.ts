import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuditLogOptions {
  userId?: string;
  action: string;
  entityName: string;
  entityId: string;
  changesJson?: Record<string, any> | string;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAuditEvent(options: AuditLogOptions): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: options.userId,
        action: options.action,
        entityName: options.entityName,
        entityId: options.entityId,
        changesJson: typeof options.changesJson === 'string' ? options.changesJson : options.changesJson ? JSON.stringify(options.changesJson) : null,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
      },
    });
  } catch (error) {
    console.error('⚠️ Failed to write audit log:', error);
  }
}
