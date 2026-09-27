import { Router, Response } from 'express';
import { query } from '../db.ts';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

// Full Inspection Report Packet
router.get('/inspection/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Inspection & Procurement info
    const inspRes = await query(
      `SELECT i.*,
              p.title as procurement_title,
              p.procurement_id_code,
              p.procurement_number,
              p.procurement_type,
              p.procurement_method,
              p.budget_source,
              p.estimated_cost,
              p.contract_amount,
              p.contract_number,
              p.contract_date,
              p.contractor_name,
              p.contract_start_date,
              p.contract_completion_date,
              p.current_status as procurement_status,
              p.ward,
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

    if (inspRes.rows.length === 0) {
      res.status(404).json({ error: 'निरीक्षण प्रतिवेदन फेला परेन।' });
      return;
    }

    const inspection = inspRes.rows[0];

    // Checklist results
    const checklistRes = await query(
      `SELECT ci.checklist_code,
              ci.stage_number,
              cs.title_ne as stage_title_ne,
              ci.inspection_area,
              ci.legal_reference,
              ci.inspection_question,
              r.compliance_status,
              r.risk_level,
              r.evidence_reference,
              r.observation,
              r.financial_impact,
              r.inspector_comment
       FROM checklist_items ci
       JOIN checklist_stages cs ON ci.stage_id = cs.id
       LEFT JOIN inspection_checklist_results r ON ci.id = r.checklist_item_id AND r.inspection_id = $1
       WHERE ci.is_active = TRUE
       ORDER BY ci.stage_number ASC, ci.sort_order ASC`,
      [id]
    );

    // Findings
    const findingsRes = await query(
      `SELECT f.*, ci.checklist_code, ci.inspection_area
       FROM findings f
       LEFT JOIN checklist_items ci ON f.checklist_item_id = ci.id
       WHERE f.inspection_id = $1
       ORDER BY f.id ASC`,
      [id]
    );

    // Corrective actions
    const actionsRes = await query(
      `SELECT ca.*, f.finding_code, f.title as finding_title
       FROM corrective_actions ca
       JOIN findings f ON ca.finding_id = f.id
       WHERE ca.inspection_id = $1
       ORDER BY ca.id ASC`,
      [id]
    );

    // Evidence attachments
    const evidenceRes = await query(
      `SELECT ef.*, ci.checklist_code
       FROM evidence_files ef
       LEFT JOIN checklist_items ci ON ef.checklist_item_id = ci.id
       WHERE ef.inspection_id = $1
       ORDER BY ef.id ASC`,
      [id]
    );

    // Statistics
    const statsRes = await query(
      `SELECT
        COUNT(*) as total_items,
        COUNT(CASE WHEN r.compliance_status = 'परिपालन' THEN 1 END) as compliant_count,
        COUNT(CASE WHEN r.compliance_status = 'आंशिक परिपालन' THEN 1 END) as partial_count,
        COUNT(CASE WHEN r.compliance_status = 'परिपालन नभएको' THEN 1 END) as non_compliant_count,
        COUNT(CASE WHEN r.compliance_status = 'लागू नहुने' THEN 1 END) as na_count,
        COUNT(CASE WHEN r.compliance_status = 'प्रमाण अपुग' THEN 1 END) as missing_evidence_count,
        COUNT(CASE WHEN r.risk_level IN ('उच्च', 'अत्यन्त उच्च') THEN 1 END) as high_risk_count,
        COALESCE(SUM(r.financial_impact), 0) as total_impact
       FROM checklist_items ci
       LEFT JOIN inspection_checklist_results r ON ci.id = r.checklist_item_id AND r.inspection_id = $1
       WHERE ci.is_active = TRUE`,
      [id]
    );

    res.json({
      inspection,
      checklist: checklistRes.rows,
      findings: findingsRes.rows,
      corrective_actions: actionsRes.rows,
      evidence: evidenceRes.rows,
      stats: statsRes.rows[0],
    });
  } catch (err: any) {
    console.error('Fetch inspection report error:', err);
    res.status(500).json({ error: 'प्रतिवेदन विवरण लोड गर्न सकिएन।' });
  }
});

// Export Procurements as CSV
router.get('/export/procurements.csv', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await query(`
      SELECT p.procurement_id_code, p.procurement_number, p.title, o.name as office_name,
             p.procurement_type, p.procurement_method, p.estimated_cost, p.contract_amount,
             p.contractor_name, p.current_status, p.created_at
      FROM procurements p
      LEFT JOIN offices o ON p.office_id = o.id
      ORDER BY p.id DESC
    `);

    let csv = 'ID Code,Procurement No,Title,Office,Type,Method,Estimated Cost (NPR),Contract Amount (NPR),Contractor,Status,Created At\n';
    result.rows.forEach(r => {
      const line = [
        `"${r.procurement_id_code || ''}"`,
        `"${r.procurement_number || ''}"`,
        `"${(r.title || '').replace(/"/g, '""')}"`,
        `"${(r.office_name || '').replace(/"/g, '""')}"`,
        `"${r.procurement_type || ''}"`,
        `"${r.procurement_method || ''}"`,
        r.estimated_cost || 0,
        r.contract_amount || 0,
        `"${(r.contractor_name || '').replace(/"/g, '""')}"`,
        `"${r.current_status || ''}"`,
        `"${r.created_at || ''}"`,
      ].join(',');
      csv += line + '\n';
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="nvc_procurements_export.csv"');
    res.send('\uFEFF' + csv); // Include UTF-8 BOM for Nepali characters in Excel
  } catch (err: any) {
    res.status(500).json({ error: 'CSV एक्पोर्ट गर्न सकिएन।' });
  }
});

// Export Findings as CSV
router.get('/export/findings.csv', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await query(`
      SELECT f.finding_code, p.procurement_id_code, p.title as procurement_title, o.name as office_name,
             f.title, f.risk_level, f.estimated_financial_impact, f.legal_reference,
             f.deadline, f.status
      FROM findings f
      JOIN procurements p ON f.procurement_id = p.id
      LEFT JOIN offices o ON p.office_id = o.id
      ORDER BY f.id DESC
    `);

    let csv = 'Finding Code,Procurement Code,Procurement,Office,Finding Title,Risk Level,Financial Impact (NPR),Legal Reference,Deadline,Status\n';
    result.rows.forEach(r => {
      const line = [
        `"${r.finding_code || ''}"`,
        `"${r.procurement_id_code || ''}"`,
        `"${(r.procurement_title || '').replace(/"/g, '""')}"`,
        `"${(r.office_name || '').replace(/"/g, '""')}"`,
        `"${(r.title || '').replace(/"/g, '""')}"`,
        `"${r.risk_level || ''}"`,
        r.estimated_financial_impact || 0,
        `"${(r.legal_reference || '').replace(/"/g, '""')}"`,
        `"${r.deadline || ''}"`,
        `"${r.status || ''}"`,
      ].join(',');
      csv += line + '\n';
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="nvc_findings_export.csv"');
    res.send('\uFEFF' + csv);
  } catch (err: any) {
    res.status(500).json({ error: 'CSV एक्पोर्ट गर्न सकिएन।' });
  }
});

export default router;
