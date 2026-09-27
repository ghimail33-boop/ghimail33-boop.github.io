import { Router, Response } from 'express';
import { query } from '../db.ts';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

// Get audit logs
router.get('/', authenticate, requireRole(['admin', 'reviewer']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { action, entity_type, limit = 100 } = req.query;
    let sql = 'SELECT * FROM audit_logs WHERE 1=1';
    const params: any[] = [];

    if (action) {
      params.push(action);
      sql += ` AND action = $${params.length}`;
    }

    if (entity_type) {
      params.push(entity_type);
      sql += ` AND entity_type = $${params.length}`;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: 'अडिट लग लोड गर्न सकिएन।' });
  }
});

export default router;
