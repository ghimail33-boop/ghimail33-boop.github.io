import { initDb, query } from './server/db.ts';

const sqls = [
  "SELECT (SELECT COUNT(*) FROM procurements) as total_procurements",
  "SELECT compliance_status, COUNT(*) as count FROM inspection_checklist_results GROUP BY compliance_status",
  "SELECT risk_level, COUNT(*) as count FROM findings GROUP BY risk_level",
  "SELECT cs.id as stage_id, cs.stage_number, cs.title_ne, cs.title_en, COUNT(DISTINCT CASE WHEN ci.is_active = TRUE THEN ci.id END) as items_count, COUNT(DISTINCT f.id) as findings_count, COALESCE(SUM(f.estimated_financial_impact), 0) as financial_impact FROM checklist_stages cs LEFT JOIN checklist_items ci ON cs.id = ci.stage_id LEFT JOIN findings f ON ci.id = f.checklist_item_id GROUP BY cs.id, cs.stage_number, cs.title_ne, cs.title_en ORDER BY cs.stage_number ASC",
  "SELECT p.id, p.name_ne, p.name_en, COUNT(i.id) as inspections_count, COUNT(f.id) as findings_count FROM provinces p LEFT JOIN procurements pr ON p.id = pr.province_id LEFT JOIN inspections i ON pr.id = i.procurement_id LEFT JOIN findings f ON pr.id = f.procurement_id GROUP BY p.id, p.name_ne, p.name_en ORDER BY p.id ASC",
  "SELECT f.id, f.finding_code, f.title, f.risk_level, f.estimated_financial_impact, f.deadline, p.title as procurement_title, o.name as office_name FROM findings f JOIN procurements p ON f.procurement_id = p.id LEFT JOIN offices o ON p.office_id = o.id WHERE f.risk_level IN ('उच्च', 'अत्यन्त उच्च') OR f.status = 'Corrective Action Required' ORDER BY f.id DESC LIMIT 6"
];

const run = async () => {
  await initDb();
  for (const [index, sql] of sqls.entries()) {
    try {
      const res = await query(sql);
      console.log('Q', index + 1, 'OK', res.rowCount);
    } catch (err) {
      console.log('Q', index + 1, 'ERROR', err instanceof Error ? err.message : String(err));
    }
  }
};

run();
