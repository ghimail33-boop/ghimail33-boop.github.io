import { Router, Request, Response } from 'express';
import { query } from '../db.ts';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth.ts';
import { logAudit } from '../utils/audit.ts';

const router = Router();

// Get all checklist items (Master Checklist)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { stage_number, is_active } = req.query;
    let sql = `
      SELECT ci.*, cs.title_ne as stage_title_ne, cs.title_en as stage_title_en
      FROM checklist_items ci
      LEFT JOIN checklist_stages cs ON ci.stage_id = cs.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (stage_number) {
      params.push(stage_number);
      sql += ` AND ci.stage_number = $${params.length}`;
    }
    if (is_active !== undefined) {
      params.push(is_active === 'true');
      sql += ` AND ci.is_active = $${params.length}`;
    }
    sql += ' ORDER BY ci.stage_number ASC, ci.sort_order ASC';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: 'मास्टर चेकलिस्ट लोड गर्न सकिएन।' });
  }
});

// Get checklist items by stage
router.get('/stages/:stage', async (req: Request, res: Response): Promise<void> => {
  try {
    const { stage } = req.params;
    const result = await query(
      `SELECT ci.*, cs.title_ne as stage_title_ne
       FROM checklist_items ci
       LEFT JOIN checklist_stages cs ON ci.stage_id = cs.id
       WHERE ci.stage_number = $1 AND ci.is_active = TRUE
       ORDER BY ci.sort_order ASC`,
      [stage]
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: 'चरणगत चेकलिस्ट लोड गर्न सकिएन।' });
  }
});

// Add new checklist item (Admin only)
router.post('/', authenticate, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      stage_number,
      inspection_area,
      legal_reference,
      required_documents,
      inspection_question,
      possible_irregularity,
      default_risk_level,
      sort_order,
    } = req.body;

    if (!stage_number || !inspection_area || !inspection_question) {
      res.status(400).json({ error: 'चरण नम्बर, अनुगमन क्षेत्र र जाँच प्रश्न अनिवार्य छन्।' });
      return;
    }

    // Get stage_id from stage_number
    const stageRes = await query('SELECT id FROM checklist_stages WHERE stage_number = $1', [stage_number]);
    if (stageRes.rows.length === 0) {
      res.status(400).json({ error: 'अमान्य चरण नम्बर।' });
      return;
    }
    const stage_id = stageRes.rows[0].id;

    // Generate code
    const countRes = await query('SELECT count(*) FROM checklist_items');
    const seq = parseInt(countRes.rows[0].count, 10) + 1;
    const checklist_code = `PROC-${String(seq).padStart(3, '0')}`;

    const result = await query(
      `INSERT INTO checklist_items (
        checklist_code, stage_id, stage_number, inspection_area, legal_reference,
        required_documents, inspection_question, possible_irregularity,
        default_risk_level, sort_order, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE)
      RETURNING *`,
      [
        checklist_code,
        stage_id,
        stage_number,
        inspection_area.trim(),
        legal_reference || 'सम्बन्धित ऐन/नियम — validation required',
        required_documents || null,
        inspection_question.trim(),
        possible_irregularity || null,
        default_risk_level || 'मध्यम',
        sort_order || seq,
      ]
    );

    await logAudit(
      req.user!.id,
      req.user!.username,
      'CREATE_CHECKLIST_ITEM',
      'ChecklistItem',
      result.rows[0].id,
      null,
      result.rows[0],
      req.ip || '127.0.0.1'
    );

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error('Create checklist item error:', err);
    res.status(500).json({ error: 'चेकलिस्ट बुँदा थप गर्न सकिएन।' });
  }
});

// Update checklist item (Admin only - preserves history, does not delete)
router.put('/:id', authenticate, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const curRes = await query('SELECT * FROM checklist_items WHERE id = $1', [id]);
    if (curRes.rows.length === 0) {
      res.status(404).json({ error: 'चेकलिस्ट बुँदा फेला परेन।' });
      return;
    }
    const oldItem = curRes.rows[0];

    const {
      inspection_area,
      legal_reference,
      required_documents,
      inspection_question,
      possible_irregularity,
      default_risk_level,
      sort_order,
      is_active,
    } = req.body;

    const result = await query(
      `UPDATE checklist_items
       SET inspection_area = COALESCE($1, inspection_area),
           legal_reference = COALESCE($2, legal_reference),
           required_documents = COALESCE($3, required_documents),
           inspection_question = COALESCE($4, inspection_question),
           possible_irregularity = COALESCE($5, possible_irregularity),
           default_risk_level = COALESCE($6, default_risk_level),
           sort_order = COALESCE($7, sort_order),
           is_active = COALESCE($8, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [
        inspection_area,
        legal_reference,
        required_documents,
        inspection_question,
        possible_irregularity,
        default_risk_level,
        sort_order,
        is_active,
        id,
      ]
    );

    await logAudit(
      req.user!.id,
      req.user!.username,
      'UPDATE_CHECKLIST_ITEM',
      'ChecklistItem',
      id,
      oldItem,
      result.rows[0],
      req.ip || '127.0.0.1'
    );

    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Update checklist item error:', err);
    res.status(500).json({ error: 'चेकलिस्ट बुँदा अद्यावधिक गर्न सकिएन।' });
  }
});

export default router;
