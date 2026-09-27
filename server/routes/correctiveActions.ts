import { Router, Response } from 'express';
import { query } from '../db.ts';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth.ts';
import { logAudit } from '../utils/audit.ts';

const router = Router();

// List corrective actions
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, finding_id, inspection_id, office_id, overdue } = req.query;

    let sql = `
      SELECT ca.*,
             f.finding_code,
             f.title as finding_title,
             f.risk_level as finding_risk_level,
             p.id as procurement_id,
             p.title as procurement_title,
             p.procurement_id_code,
             o.name as office_name,
             CASE
               WHEN ca.deadline < CURRENT_DATE AND ca.status NOT IN ('सम्पन्न', 'प्रमाणित') THEN TRUE
               ELSE FALSE
             END as is_overdue
      FROM corrective_actions ca
      JOIN findings f ON ca.finding_id = f.id
      JOIN procurements p ON f.procurement_id = p.id
      LEFT JOIN offices o ON p.office_id = o.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      params.push(status);
      sql += ` AND ca.status = $${params.length}`;
    }

    if (finding_id) {
      params.push(finding_id);
      sql += ` AND ca.finding_id = $${params.length}`;
    }

    if (inspection_id) {
      params.push(inspection_id);
      sql += ` AND ca.inspection_id = $${params.length}`;
    }

    if (office_id) {
      params.push(office_id);
      sql += ` AND p.office_id = $${params.length}`;
    }

    if (overdue === 'true') {
      sql += ` AND ca.deadline < CURRENT_DATE AND ca.status NOT IN ('सम्पन्न', 'प्रमाणित')`;
    }

    sql += ' ORDER BY ca.deadline ASC, ca.id DESC';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Fetch corrective actions error:', err);
    res.status(500).json({ error: 'सुधारात्मक कार्य सूची लोड गर्न सकिएन।' });
  }
});

// Create corrective action
router.post('/', authenticate, requireRole(['admin', 'inspector', 'reviewer']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      finding_id,
      inspection_id,
      corrective_action_text,
      responsible_office,
      responsible_officer,
      deadline,
      status,
    } = req.body;

    if (!finding_id || !corrective_action_text) {
      res.status(400).json({ error: 'Finding र सुधारात्मक कार्य विवरण अनिवार्य छन्।' });
      return;
    }

    const result = await query(
      `INSERT INTO corrective_actions (
        finding_id, inspection_id, corrective_action_text, responsible_office,
        responsible_officer, deadline, status
      ) VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'बाँकी'))
      RETURNING *`,
      [
        finding_id,
        inspection_id || null,
        corrective_action_text.trim(),
        responsible_office || null,
        responsible_officer || null,
        deadline || null,
        status || 'बाँकी',
      ]
    );

    const newAction = result.rows[0];

    await logAudit(
      req.user!.id,
      req.user!.username,
      'CREATE_CORRECTIVE_ACTION',
      'CorrectiveAction',
      newAction.id,
      null,
      newAction,
      req.ip || '127.0.0.1'
    );

    res.status(201).json(newAction);
  } catch (err: any) {
    console.error('Create corrective action error:', err);
    res.status(500).json({ error: 'सुधारात्मक कार्य सिर्जना गर्न सकिएन।' });
  }
});

// Update corrective action progress & status
router.put('/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const curRes = await query('SELECT * FROM corrective_actions WHERE id = $1', [id]);
    if (curRes.rows.length === 0) {
      res.status(404).json({ error: 'सुधारात्मक कार्य फेला परेन।' });
      return;
    }
    const oldAction = curRes.rows[0];

    const {
      corrective_action_text,
      responsible_office,
      responsible_officer,
      deadline,
      progress_notes,
      completion_date,
      status,
    } = req.body;

    // Determine status - auto flag overdue if past deadline and not completed
    let finalStatus = status || oldAction.status;
    const effDeadline = deadline || oldAction.deadline;
    if (effDeadline && new Date(effDeadline) < new Date() && !['सम्पन्न', 'प्रमाणित'].includes(finalStatus)) {
      if (finalStatus === 'बाँकी') {
        finalStatus = 'समयसीमा नाघेको';
      }
    }

    const result = await query(
      `UPDATE corrective_actions
       SET corrective_action_text = COALESCE($1, corrective_action_text),
           responsible_office = COALESCE($2, responsible_office),
           responsible_officer = COALESCE($3, responsible_officer),
           deadline = $4,
           progress_notes = COALESCE($5, progress_notes),
           completion_date = $6,
           status = COALESCE($7, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [
        corrective_action_text,
        responsible_office,
        responsible_officer,
        deadline !== undefined ? deadline : oldAction.deadline,
        progress_notes,
        completion_date || null,
        finalStatus,
        id,
      ]
    );

    await logAudit(
      req.user!.id,
      req.user!.username,
      'UPDATE_CORRECTIVE_ACTION',
      'CorrectiveAction',
      id,
      oldAction,
      result.rows[0],
      req.ip || '127.0.0.1'
    );

    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Update corrective action error:', err);
    res.status(500).json({ error: 'सुधारात्मक कार्य अद्यावधिक गर्न सकिएन।' });
  }
});

// Verify corrective action (Reviewer or Admin)
router.put('/:id/verify', authenticate, requireRole(['admin', 'reviewer']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { verification_status, verification_remarks } = req.body;

    const curRes = await query('SELECT * FROM corrective_actions WHERE id = $1', [id]);
    if (curRes.rows.length === 0) {
      res.status(404).json({ error: 'सुधारात्मक कार्य फेला परेन।' });
      return;
    }

    const newStatus = verification_status === 'Verified' ? 'प्रमाणित' : 'प्रक्रियामा';

    const result = await query(
      `UPDATE corrective_actions
       SET verification_status = $1,
           verification_remarks = $2,
           verification_officer = $3,
           verified_at = CURRENT_TIMESTAMP,
           status = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [verification_status, verification_remarks, req.user!.full_name, newStatus, id]
    );

    // If verified, also update finding status to Resolved
    if (verification_status === 'Verified') {
      const action = result.rows[0];
      await query(
        `UPDATE findings
         SET status = 'Resolved', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [action.finding_id]
      );
    }

    await logAudit(
      req.user!.id,
      req.user!.username,
      'VERIFY_CORRECTIVE_ACTION',
      'CorrectiveAction',
      id,
      curRes.rows[0],
      result.rows[0],
      req.ip || '127.0.0.1'
    );

    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: 'प्रमाणीकरण सुरक्षित गर्न सकिएन।' });
  }
});

export default router;
