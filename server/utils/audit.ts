import { query } from '../db.ts';

export async function logAudit(
  userId: number | null,
  username: string | null,
  action: string,
  entityType: string,
  entityId: string | number | null,
  oldValues: any = null,
  newValues: any = null,
  ipAddress: string = '127.0.0.1'
) {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, username, action, entity_type, entity_id, old_values, new_values, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId,
        username,
        action,
        entityType,
        entityId ? String(entityId) : null,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        ipAddress,
      ]
    );
  } catch (err) {
    console.error('[AUDIT LOG ERROR]', err);
  }
}
