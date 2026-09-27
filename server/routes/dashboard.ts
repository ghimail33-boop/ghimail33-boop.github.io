import { Router, Request, Response } from 'express';
import { query } from '../db.ts';

const router = Router();

// Dashboard summary KPIs
router.get('/summary', async (_req: Request, res: Response): Promise<void> => {
  try {
    const kpiRes = await query(`
      SELECT
        (SELECT COUNT(*) FROM procurements) as total_procurements,
        (SELECT COUNT(*) FROM inspections) as total_inspections,
        (SELECT COUNT(*) FROM inspections WHERE status IN ('In Progress', 'Submitted', 'Under Review')) as in_progress_inspections,
        (SELECT COUNT(*) FROM inspections WHERE status = 'Verified') as verified_inspections,
        (SELECT COUNT(*) FROM findings) as total_findings,
        (SELECT COUNT(*) FROM findings WHERE risk_level IN ('उच्च', 'अत्यन्त उच्च')) as high_critical_findings,
        (SELECT COUNT(*) FROM findings WHERE status IN ('Open', 'Corrective Action Required')) as open_findings,
        (SELECT COUNT(*) FROM corrective_actions WHERE deadline < CURRENT_DATE AND status NOT IN ('सम्पन्न', 'प्रमाणित')) as overdue_corrective_actions,
        (SELECT COALESCE(SUM(estimated_financial_impact), 0) FROM findings) as total_financial_impact,
        (SELECT COALESCE(SUM(contract_amount), 0) FROM procurements) as total_contract_volume,
        (SELECT COUNT(*) FROM checklist_stages) as total_checklist_stages,
        (SELECT COUNT(*) FROM checklist_items WHERE is_active = TRUE) as total_checklist_items
    `);

    // Compliance stats
    const complianceRes = await query(`
      SELECT
        compliance_status,
        COUNT(*) as count
      FROM inspection_checklist_results
      GROUP BY compliance_status
    `);

    // Risk distribution
    const riskRes = await query(`
      SELECT
        risk_level,
        COUNT(*) as count
      FROM findings
      GROUP BY risk_level
    `);

    // Findings by Stage (साथै प्रत्येक चरणको सक्रिय checklist बुँदा संख्या)
    const stageRes = await query(`
      SELECT
        cs.id as stage_id,
        cs.stage_number,
        cs.title_ne,
        cs.title_en,
        COUNT(DISTINCT CASE WHEN ci.is_active = TRUE THEN ci.id END) as items_count,
        COUNT(DISTINCT f.id) as findings_count,
        COALESCE(SUM(f.estimated_financial_impact), 0) as financial_impact
      FROM checklist_stages cs
      LEFT JOIN checklist_items ci ON cs.id = ci.stage_id
      LEFT JOIN findings f ON ci.id = f.checklist_item_id
      GROUP BY cs.id, cs.stage_number, cs.title_ne, cs.title_en
      ORDER BY cs.stage_number ASC
    `);

    // Inspections by Province
    const provinceRes = await query(`
      SELECT
        p.id,
        p.name_ne,
        p.name_en,
        COUNT(i.id) as inspections_count,
        COUNT(f.id) as findings_count
      FROM provinces p
      LEFT JOIN procurements pr ON p.id = pr.province_id
      LEFT JOIN inspections i ON pr.id = i.procurement_id
      LEFT JOIN findings f ON pr.id = f.procurement_id
      GROUP BY p.id, p.name_ne, p.name_en
      ORDER BY p.id ASC
    `);

    // Recent critical alerts
    const alertsRes = await query(`
      SELECT
        f.id,
        f.finding_code,
        f.title,
        f.risk_level,
        f.estimated_financial_impact,
        f.deadline,
        p.title as procurement_title,
        o.name as office_name
      FROM findings f
      JOIN procurements p ON f.procurement_id = p.id
      LEFT JOIN offices o ON p.office_id = o.id
      WHERE f.risk_level IN ('उच्च', 'अत्यन्त उच्च') OR f.status = 'Corrective Action Required'
      ORDER BY f.id DESC
      LIMIT 6
    `);

    res.json({
      kpis: kpiRes.rows[0],
      compliance: complianceRes.rows,
      risk: riskRes.rows,
      stages: stageRes.rows,
      provinces: provinceRes.rows,
      alerts: alertsRes.rows,
    });
  } catch (err: any) {
    console.error('Fetch dashboard summary error:', err);
    res.status(500).json({ error: 'ड्यासबोर्ड तथ्याङ्क लोड गर्न सकिएन।' });
  }
});

export default router;
