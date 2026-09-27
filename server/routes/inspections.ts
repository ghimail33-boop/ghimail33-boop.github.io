import { Router, Response } from 'express';
import { query } from '../db.ts';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth.ts';
import { logAudit } from '../utils/audit.ts';

const router = Router();

// List inspections
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, procurement_id, office_id, search } = req.query;

    let sql = `
      SELECT i.*,
             p.title as procurement_title,
             p.procurement_id_code,
             p.procurement_number,
             p.procurement_type,
             p.procurement_method,
             p.estimated_cost,
             p.contract_amount,
             p.contractor_name,
             o.name as office_name,
             u.full_name as lead_inspector_name,
             (SELECT COUNT(*) FROM findings f WHERE f.inspection_id = i.id) as findings_count,
             (SELECT COUNT(*) FROM findings f WHERE f.inspection_id = i.id AND f.risk_level IN ('उच्च', 'अत्यन्त उच्च')) as high_risk_findings_count
      FROM inspections i
      JOIN procurements p ON i.procurement_id = p.id
      LEFT JOIN offices o ON p.office_id = o.id
      LEFT JOIN users u ON i.lead_inspector_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      params.push(status);
      sql += ` AND i.status = $${params.length}`;
    }

    if (procurement_id) {
      params.push(procurement_id);
      sql += ` AND i.procurement_id = $${params.length}`;
    }

    if (office_id) {
      params.push(office_id);
      sql += ` AND p.office_id = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (
        p.title ILIKE $${params.length} OR
        p.procurement_id_code ILIKE $${params.length} OR
        i.inspection_code ILIKE $${params.length} OR
        o.name ILIKE $${params.length}
      )`;
    }

    sql += ' ORDER BY i.id DESC';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Fetch inspections error:', err);
    res.status(500).json({ error: 'निरीक्षण सूची लोड गर्न सकिएन।' });
  }
});

// Get single inspection details
router.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT i.*,
              p.id as procurement_id,
              p.title as procurement_title,
              p.procurement_id_code,
              p.procurement_number,
              p.procurement_type,
              p.procurement_method,
              p.estimated_cost,
              p.contract_amount,
              p.contractor_name,
              p.contract_start_date,
              p.contract_completion_date,
              p.current_status as procurement_status,
              p.budget_source,
              p.ward,
              o.id as office_id,
              o.name as office_name,
              m.name_ne as ministry_name,
              pr.name_ne as province_name,
              d.name_ne as district_name,
              mun.name_ne as municipality_name,
              fy.name as fiscal_year_name,
              u.full_name as lead_inspector_name,
              v.full_name as verified_by_name
       FROM inspections i
       JOIN procurements p ON i.procurement_id = p.id
       LEFT JOIN offices o ON p.office_id = o.id
       LEFT JOIN ministries m ON p.ministry_id = m.id
       LEFT JOIN provinces pr ON p.province_id = pr.id
       LEFT JOIN districts d ON p.district_id = d.id
       LEFT JOIN municipalities mun ON p.municipality_id = mun.id
       LEFT JOIN fiscal_years fy ON p.fiscal_year_id = fy.id
       LEFT JOIN users u ON i.lead_inspector_id = u.id
       LEFT JOIN users v ON i.verified_by = v.id
       WHERE i.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'निरीक्षण फेला परेन।' });
      return;
    }

    const inspection = result.rows[0];

    // Compliance statistics
    const statsRes = await query(
      `SELECT
        COUNT(*) as total_items,
        COUNT(CASE WHEN r.compliance_status IS NOT NULL AND r.compliance_status != 'जाँच बाँकी' THEN 1 END) as checked_items,
        COUNT(CASE WHEN r.compliance_status = 'परिपालन' THEN 1 END) as compliant_items,
        COUNT(CASE WHEN r.compliance_status = 'आंशिक परिपालन' THEN 1 END) as partial_items,
        COUNT(CASE WHEN r.compliance_status = 'परिपालन नभएको' THEN 1 END) as non_compliant_items,
        COUNT(CASE WHEN r.compliance_status = 'लागू नहुने' THEN 1 END) as na_items,
        COUNT(CASE WHEN r.compliance_status = 'प्रमाण अपुग' THEN 1 END) as missing_evidence_items,
        COUNT(CASE WHEN r.risk_level = 'उच्च' THEN 1 END) as high_risk_items,
        COUNT(CASE WHEN r.risk_level = 'अत्यन्त उच्च' THEN 1 END) as critical_risk_items,
        COALESCE(SUM(r.financial_impact), 0) as total_financial_impact
       FROM checklist_items ci
       LEFT JOIN inspection_checklist_results r ON ci.id = r.checklist_item_id AND r.inspection_id = $1
       WHERE ci.is_active = TRUE`,
      [id]
    );

    res.json({
      ...inspection,
      stats: statsRes.rows[0],
    });
  } catch (err: any) {
    console.error('Fetch inspection error:', err);
    res.status(500).json({ error: 'निरीक्षण विवरण प्राप्त गर्न सकिएन।' });
  }
});

// Create inspection
router.post('/', authenticate, requireRole(['admin', 'inspector']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { procurement_id, inspection_date, inspection_team, summary_notes } = req.body;

    if (!procurement_id) {
      res.status(400).json({ error: 'खरिद ID अनिवार्य छ।' });
      return;
    }

    const countRes = await query('SELECT count(*) FROM inspections');
    const seq = parseInt(countRes.rows[0].count, 10) + 1;
    const inspection_code = `INSP-2083-${String(seq).padStart(3, '0')}`;

    const result = await query(
      `INSERT INTO inspections (
        inspection_code, procurement_id, inspection_date, status, lead_inspector_id,
        inspection_team, summary_notes, created_by
      ) VALUES ($1, $2, COALESCE($3, CURRENT_DATE), 'Draft', $4, $5, $6, $7)
      RETURNING *`,
      [
        inspection_code,
        procurement_id,
        inspection_date || null,
        req.user!.id,
        inspection_team || req.user!.full_name,
        summary_notes || null,
        req.user!.id,
      ]
    );

    const newInsp = result.rows[0];

    await logAudit(
      req.user!.id,
      req.user!.username,
      'CREATE_INSPECTION',
      'Inspection',
      newInsp.id,
      null,
      newInsp,
      req.ip || '127.0.0.1'
    );

    res.status(201).json(newInsp);
  } catch (err: any) {
    console.error('Create inspection error:', err);
    res.status(500).json({ error: 'निरीक्षण सिर्जना गर्न सकिएन।' });
  }
});

// Update inspection metadata / status
router.put('/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const curRes = await query('SELECT * FROM inspections WHERE id = $1', [id]);
    if (curRes.rows.length === 0) {
      res.status(404).json({ error: 'निरीक्षण फेला परेन।' });
      return;
    }
    const oldInsp = curRes.rows[0];

    const { inspection_date, status, inspection_team, summary_notes } = req.body;

    // Role-based workflow validation: Only Reviewer or Admin can verify/close
    if (['Verified', 'Closed'].includes(status) && !['admin', 'reviewer'].includes(req.user!.role)) {
      res.status(403).json({ error: 'निरीक्षण प्रमाणीकरण (Verify/Close) गर्ने अधिकार केवल पुनरावलोकनकर्ता वा प्रशासकलाई मात्र छ।' });
      return;
    }

    let verifiedBy = oldInsp.verified_by;
    let verifiedAt = oldInsp.verified_at;
    if (status === 'Verified' && oldInsp.status !== 'Verified') {
      verifiedBy = req.user!.id;
      verifiedAt = new Date().toISOString();
    }

    const result = await query(
      `UPDATE inspections
       SET inspection_date = COALESCE($1, inspection_date),
           status = COALESCE($2, status),
           inspection_team = COALESCE($3, inspection_team),
           summary_notes = COALESCE($4, summary_notes),
           verified_by = $5,
           verified_at = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [inspection_date, status, inspection_team, summary_notes, verifiedBy, verifiedAt, id]
    );

    await logAudit(
      req.user!.id,
      req.user!.username,
      'UPDATE_INSPECTION',
      'Inspection',
      id,
      oldInsp,
      result.rows[0],
      req.ip || '127.0.0.1'
    );

    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Update inspection error:', err);
    res.status(500).json({ error: 'निरीक्षण अद्यावधिक गर्न सकिएन।' });
  }
});

// Get stage-by-stage checklist with existing results for this inspection
router.get('/:id/checklist', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { stage } = req.query;

    let sql = `
      SELECT ci.id as checklist_item_id,
             ci.checklist_code,
             ci.stage_id,
             ci.stage_number,
             ci.inspection_area,
             ci.legal_reference,
             ci.required_documents,
             ci.inspection_question,
             ci.possible_irregularity,
             ci.default_risk_level,
             ci.sort_order,
             cs.title_ne as stage_title_ne,
             cs.title_en as stage_title_en,
             r.id as result_id,
             r.compliance_status,
             r.risk_level,
             r.evidence_reference,
             r.observation,
             r.financial_impact,
             r.inspector_comment,
             r.completed_at,
             (SELECT COUNT(*) FROM evidence_files ef WHERE ef.inspection_id = $1 AND ef.checklist_item_id = ci.id) as evidence_count,
             (SELECT COUNT(*) FROM findings f WHERE f.inspection_id = $1 AND f.checklist_item_id = ci.id) as findings_count
      FROM checklist_items ci
      JOIN checklist_stages cs ON ci.stage_id = cs.id
      LEFT JOIN inspection_checklist_results r ON ci.id = r.checklist_item_id AND r.inspection_id = $1
      WHERE ci.is_active = TRUE
    `;

    const params: any[] = [id];
    if (stage) {
      params.push(stage);
      sql += ` AND ci.stage_number = $${params.length}`;
    }

    sql += ' ORDER BY ci.stage_number ASC, ci.sort_order ASC';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Fetch checklist results error:', err);
    res.status(500).json({ error: 'चेकलिस्ट विवरण लोड गर्न सकिएन।' });
  }
});

// Save or Update Inspection Checklist Item Result (Atomic save & recalculation)
router.post('/:id/checklist/save-item', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      checklist_item_id,
      compliance_status,
      risk_level,
      evidence_reference,
      observation,
      financial_impact,
      inspector_comment,
    } = req.body;

    if (!checklist_item_id || !compliance_status) {
      res.status(400).json({ error: 'चेकलिस्ट बुँदा र परिपालन अवस्था अनिवार्य छन्।' });
      return;
    }

    // Upsert into inspection_checklist_results
    const upsertSql = `
      INSERT INTO inspection_checklist_results (
        inspection_id, checklist_item_id, compliance_status, risk_level,
        evidence_reference, observation, financial_impact, inspector_comment,
        completed_by, completed_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (inspection_id, checklist_item_id)
      DO UPDATE SET
        compliance_status = EXCLUDED.compliance_status,
        risk_level = EXCLUDED.risk_level,
        evidence_reference = EXCLUDED.evidence_reference,
        observation = EXCLUDED.observation,
        financial_impact = EXCLUDED.financial_impact,
        inspector_comment = EXCLUDED.inspector_comment,
        completed_by = EXCLUDED.completed_by,
        completed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await query(upsertSql, [
      id,
      checklist_item_id,
      compliance_status,
      risk_level || 'मध्यम',
      evidence_reference || null,
      observation || null,
      financial_impact ? parseFloat(financial_impact) : 0,
      inspector_comment || null,
      req.user!.id,
    ]);

    // Recalculate Inspection completion percentage and risk score
    const calcRes = await query(
      `SELECT
        COUNT(*) as total_active,
        COUNT(CASE WHEN r.compliance_status IS NOT NULL AND r.compliance_status != 'जाँच बाँकी' THEN 1 END) as checked,
        COUNT(CASE WHEN r.compliance_status = 'लागू नहुने' THEN 1 END) as na_count,
        COUNT(CASE WHEN r.risk_level = 'उच्च' THEN 1 END) as high_risk,
        COUNT(CASE WHEN r.risk_level = 'अत्यन्त उच्च' THEN 1 END) as critical_risk
       FROM checklist_items ci
       LEFT JOIN inspection_checklist_results r ON ci.id = r.checklist_item_id AND r.inspection_id = $1
       WHERE ci.is_active = TRUE`,
      [id]
    );

    const stats = calcRes.rows[0];
    const totalActive = parseInt(stats.total_active, 10);
    const checked = parseInt(stats.checked, 10);
    const naCount = parseInt(stats.na_count, 10);
    const highRisk = parseInt(stats.high_risk, 10);
    const criticalRisk = parseInt(stats.critical_risk, 10);

    const applicableCount = totalActive - naCount;
    const completionPct = applicableCount > 0 ? Math.min(100, Math.round(((checked - naCount) / applicableCount) * 100)) : 100;
    const riskScore = Math.min(4.0, (highRisk * 0.5 + criticalRisk * 1.0));

    await query(
      `UPDATE inspections
       SET completion_percentage = $1,
           risk_score = $2,
           status = CASE WHEN status = 'Draft' AND $3 > 0 THEN 'In Progress' ELSE status END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [completionPct, riskScore, checked, id]
    );

    res.json({
      success: true,
      result: result.rows[0],
      completion_percentage: completionPct,
      risk_score: riskScore,
    });
  } catch (err: any) {
    console.error('Save checklist result error:', err);
    res.status(500).json({ error: 'चेकलिस्ट नतिजा सुरक्षित गर्न सकिएन।' });
  }
});

export default router;
