import { Router, Response } from 'express';
import { query } from '../db.ts';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth.ts';
import { logAudit } from '../utils/audit.ts';

const router = Router();

// List findings with filters
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { risk_level, status, procurement_id, inspection_id, office_id, search } = req.query;

    let sql = `
      SELECT f.*,
             p.title as procurement_title,
             p.procurement_id_code,
             o.name as office_name,
             ci.checklist_code,
             ci.inspection_area,
             ci.stage_number,
             u.full_name as creator_name,
             (SELECT COUNT(*) FROM corrective_actions ca WHERE ca.finding_id = f.id) as corrective_actions_count,
             (SELECT COUNT(*) FROM corrective_actions ca WHERE ca.finding_id = f.id AND ca.status != 'प्रमाणित') as pending_actions_count
      FROM findings f
      JOIN procurements p ON f.procurement_id = p.id
      LEFT JOIN offices o ON p.office_id = o.id
      LEFT JOIN checklist_items ci ON f.checklist_item_id = ci.id
      LEFT JOIN users u ON f.created_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (risk_level) {
      params.push(risk_level);
      sql += ` AND f.risk_level = $${params.length}`;
    }

    if (status) {
      params.push(status);
      sql += ` AND f.status = $${params.length}`;
    }

    if (procurement_id) {
      params.push(procurement_id);
      sql += ` AND f.procurement_id = $${params.length}`;
    }

    if (inspection_id) {
      params.push(inspection_id);
      sql += ` AND f.inspection_id = $${params.length}`;
    }

    if (office_id) {
      params.push(office_id);
      sql += ` AND p.office_id = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (
        f.title ILIKE $${params.length} OR
        f.finding_code ILIKE $${params.length} OR
        f.description ILIKE $${params.length} OR
        p.title ILIKE $${params.length}
      )`;
    }

    sql += ' ORDER BY f.id DESC';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Fetch findings error:', err);
    res.status(500).json({ error: 'Findings लोड गर्न सकिएन।' });
  }
});

// Get single finding
router.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT f.*,
              p.title as procurement_title,
              p.procurement_id_code,
              p.contractor_name,
              o.name as office_name,
              ci.checklist_code,
              ci.inspection_area,
              ci.stage_number,
              ci.inspection_question,
              i.inspection_code
       FROM findings f
       JOIN procurements p ON f.procurement_id = p.id
       LEFT JOIN offices o ON p.office_id = o.id
       LEFT JOIN checklist_items ci ON f.checklist_item_id = ci.id
       LEFT JOIN inspections i ON f.inspection_id = i.id
       WHERE f.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Finding फेला परेन।' });
      return;
    }

    // Associated corrective actions
    const caRes = await query(
      `SELECT * FROM corrective_actions WHERE finding_id = $1 ORDER BY id ASC`,
      [id]
    );

    res.json({
      ...result.rows[0],
      corrective_actions: caRes.rows,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Finding विवरण लोड गर्न सकिएन।' });
  }
});

// Create finding
router.post('/', authenticate, requireRole(['admin', 'inspector']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      inspection_id,
      procurement_id,
      checklist_item_id,
      checklist_result_id,
      title,
      description,
      legal_reference,
      evidence_summary,
      possible_irregularity,
      risk_level,
      estimated_financial_impact,
      responsible_office,
      responsible_officer,
      recommended_corrective_action,
      deadline,
      deadline_bs,
      status,
      inspector_remarks,
    } = req.body;

    if (!title || !description || !procurement_id) {
      res.status(400).json({ error: 'शीर्षक, विवरण र खरिद ID अनिवार्य छन्।' });
      return;
    }

    const countRes = await query('SELECT count(*) FROM findings');
    const seq = parseInt(countRes.rows[0].count, 10) + 1;
    const finding_code = `FND-2083-${String(seq).padStart(3, '0')}`;

    const result = await query(
      `INSERT INTO findings (
        finding_code, inspection_id, procurement_id, checklist_item_id, checklist_result_id,
        title, description, legal_reference, evidence_summary, possible_irregularity,
        risk_level, estimated_financial_impact, responsible_office, responsible_officer,
        recommended_corrective_action, deadline, status, inspector_remarks, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *`,
      [
        finding_code,
        inspection_id || null,
        procurement_id,
        checklist_item_id || null,
        checklist_result_id || null,
        title.trim(),
        description.trim(),
        legal_reference || null,
        evidence_summary || null,
        possible_irregularity || null,
        risk_level || 'उच्च',
        estimated_financial_impact ? parseFloat(estimated_financial_impact) : 0,
        responsible_office || null,
        responsible_officer || null,
        recommended_corrective_action || null,
        deadline || null,
        status || 'Open',
        inspector_remarks || null,
        req.user!.id,
      ]
    );

    const newFinding = result.rows[0];

    // If recommended corrective action is provided, automatically create a corrective action record
    if (recommended_corrective_action && recommended_corrective_action.trim().length > 0) {
      await query(
        `INSERT INTO corrective_actions (
          finding_id, inspection_id, corrective_action_text, responsible_office,
          responsible_officer, deadline, status, deadline_bs
        ) VALUES ($1, $2, $3, $4, $5, $6, 'बाँकी', $7)`,
        [
          newFinding.id,
          inspection_id || null,
          recommended_corrective_action.trim(),
          responsible_office || null,
          responsible_officer || null,
          deadline || null,
          deadline_bs || null,
        ]
      );
    }

    await logAudit(
      req.user!.id,
      req.user!.username,
      'CREATE_FINDING',
      'Finding',
      newFinding.id,
      null,
      newFinding,
      req.ip || '127.0.0.1'
    );

    res.status(201).json(newFinding);
  } catch (err: any) {
    console.error('Create finding error:', err);
    res.status(500).json({ error: 'Finding सिर्जना गर्न सकिएन।' });
  }
});

// Update finding
router.put('/:id', authenticate, requireRole(['admin', 'inspector', 'reviewer']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const curRes = await query('SELECT * FROM findings WHERE id = $1', [id]);
    if (curRes.rows.length === 0) {
      res.status(404).json({ error: 'Finding फेला परेन।' });
      return;
    }
    const oldFinding = curRes.rows[0];

    const {
      title,
      description,
      legal_reference,
      evidence_summary,
      possible_irregularity,
      risk_level,
      estimated_financial_impact,
      responsible_office,
      responsible_officer,
      recommended_corrective_action,
      deadline,
      status,
      inspector_remarks,
    } = req.body;

    const result = await query(
      `UPDATE findings
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           legal_reference = COALESCE($3, legal_reference),
           evidence_summary = COALESCE($4, evidence_summary),
           possible_irregularity = COALESCE($5, possible_irregularity),
           risk_level = COALESCE($6, risk_level),
           estimated_financial_impact = COALESCE($7, estimated_financial_impact),
           responsible_office = COALESCE($8, responsible_office),
           responsible_officer = COALESCE($9, responsible_officer),
           recommended_corrective_action = COALESCE($10, recommended_corrective_action),
           deadline = $11,
           status = COALESCE($12, status),
           inspector_remarks = COALESCE($13, inspector_remarks),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $14
       RETURNING *`,
      [
        title,
        description,
        legal_reference,
        evidence_summary,
        possible_irregularity,
        risk_level,
        estimated_financial_impact !== undefined ? parseFloat(estimated_financial_impact) : null,
        responsible_office,
        responsible_officer,
        recommended_corrective_action,
        deadline !== undefined ? deadline : oldFinding.deadline,
        status,
        inspector_remarks,
        id,
      ]
    );

    await logAudit(
      req.user!.id,
      req.user!.username,
      'UPDATE_FINDING',
      'Finding',
      id,
      oldFinding,
      result.rows[0],
      req.ip || '127.0.0.1'
    );

    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Update finding error:', err);
    res.status(500).json({ error: 'Finding अद्यावधिक गर्न सकिएन।' });
  }
});

// Delete finding
router.delete('/:id', authenticate, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const curRes = await query('SELECT * FROM findings WHERE id = $1', [id]);
    if (curRes.rows.length === 0) {
      res.status(404).json({ error: 'Finding फेला परेन।' });
      return;
    }
    const oldFinding = curRes.rows[0];

    await query('DELETE FROM findings WHERE id = $1', [id]);

    await logAudit(
      req.user!.id,
      req.user!.username,
      'DELETE_FINDING',
      'Finding',
      id,
      oldFinding,
      null,
      req.ip || '127.0.0.1'
    );

    res.json({ success: true, message: 'Finding हटाइयो।' });
  } catch (err: any) {
    res.status(500).json({ error: 'Finding हटाउन सकिएन।' });
  }
});

export default router;
