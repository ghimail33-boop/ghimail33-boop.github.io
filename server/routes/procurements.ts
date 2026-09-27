import { Router, Response } from 'express';
import { query } from '../db.ts';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth.ts';
import { logAudit } from '../utils/audit.ts';

const router = Router();

// List Procurements with comprehensive filters
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      search,
      office_id,
      ministry_id,
      province_id,
      fiscal_year_id,
      procurement_type,
      procurement_method,
      current_status,
      limit = 100,
      offset = 0,
    } = req.query;

    let sql = `
      SELECT p.*,
             o.name as office_name,
             m.name_ne as ministry_name,
             pr.name_ne as province_name,
             d.name_ne as district_name,
             mun.name_ne as municipality_name,
             fy.name as fiscal_year_name,
             i.id as latest_inspection_id,
             i.inspection_code as latest_inspection_code,
             i.status as inspection_status,
             i.completion_percentage,
             i.risk_score,
             (SELECT COUNT(*) FROM findings f WHERE f.procurement_id = p.id) as findings_count,
             (SELECT COUNT(*) FROM findings f WHERE f.procurement_id = p.id AND f.risk_level IN ('उच्च', 'अत्यन्त उच्च')) as high_risk_findings_count
      FROM procurements p
      LEFT JOIN offices o ON p.office_id = o.id
      LEFT JOIN ministries m ON p.ministry_id = m.id
      LEFT JOIN provinces pr ON p.province_id = pr.id
      LEFT JOIN districts d ON p.district_id = d.id
      LEFT JOIN municipalities mun ON p.municipality_id = mun.id
      LEFT JOIN fiscal_years fy ON p.fiscal_year_id = fy.id
      LEFT JOIN LATERAL (
        SELECT id, inspection_code, status, completion_percentage, risk_score
        FROM inspections
        WHERE procurement_id = p.id
        ORDER BY id DESC
        LIMIT 1
      ) i ON TRUE
      WHERE 1=1
    `;

    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (
        p.title ILIKE $${params.length} OR
        p.procurement_id_code ILIKE $${params.length} OR
        p.procurement_number ILIKE $${params.length} OR
        p.contractor_name ILIKE $${params.length} OR
        o.name ILIKE $${params.length}
      )`;
    }

    if (office_id) {
      params.push(office_id);
      sql += ` AND p.office_id = $${params.length}`;
    }

    if (ministry_id) {
      params.push(ministry_id);
      sql += ` AND p.ministry_id = $${params.length}`;
    }

    if (province_id) {
      params.push(province_id);
      sql += ` AND p.province_id = $${params.length}`;
    }

    if (fiscal_year_id) {
      params.push(fiscal_year_id);
      sql += ` AND p.fiscal_year_id = $${params.length}`;
    }

    if (procurement_type) {
      params.push(procurement_type);
      sql += ` AND p.procurement_type = $${params.length}`;
    }

    if (procurement_method) {
      params.push(procurement_method);
      sql += ` AND p.procurement_method = $${params.length}`;
    }

    if (current_status) {
      params.push(current_status);
      sql += ` AND p.current_status = $${params.length}`;
    }

    sql += ` ORDER BY p.id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Fetch procurements error:', err);
    res.status(500).json({ error: 'खरिद विवरणहरू लोड गर्न सकिएन।' });
  }
});

// Get Single Procurement Details
router.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT p.*,
              o.name as office_name,
              m.name_ne as ministry_name,
              pr.name_ne as province_name,
              d.name_ne as district_name,
              mun.name_ne as municipality_name,
              fy.name as fiscal_year_name,
              u.full_name as creator_name
       FROM procurements p
       LEFT JOIN offices o ON p.office_id = o.id
       LEFT JOIN ministries m ON p.ministry_id = m.id
       LEFT JOIN provinces pr ON p.province_id = pr.id
       LEFT JOIN districts d ON p.district_id = d.id
       LEFT JOIN municipalities mun ON p.municipality_id = mun.id
       LEFT JOIN fiscal_years fy ON p.fiscal_year_id = fy.id
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'खरिद अभिलेख फेला परेन।' });
      return;
    }

    const procurement = result.rows[0];

    // Also fetch associated inspections
    const inspectionsRes = await query(
      `SELECT i.*, u.full_name as lead_inspector_name
       FROM inspections i
       LEFT JOIN users u ON i.lead_inspector_id = u.id
       WHERE i.procurement_id = $1
       ORDER BY i.id DESC`,
      [id]
    );

    // Also fetch associated document completeness checklist
    const docsRes = await query(
      `SELECT * FROM procurement_documents WHERE procurement_id = $1 ORDER BY id ASC`,
      [id]
    );

    res.json({
      ...procurement,
      inspections: inspectionsRes.rows,
      documents: docsRes.rows,
    });
  } catch (err: any) {
    console.error('Fetch single procurement error:', err);
    res.status(500).json({ error: 'खरिद विवरण प्राप्त गर्न सकिएन।' });
  }
});

// Register New Procurement
router.post('/', authenticate, requireRole(['admin', 'inspector']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      procurement_number,
      office_id,
      office_name,
      ministry_id,
      province_id,
      district_id,
      municipality_id,
      ward,
      title,
      procurement_type,
      procurement_method,
      fiscal_year_id,
      budget_source,
      estimated_cost,
      contract_amount,
      contract_number,
      contract_date,
      contractor_name,
      contract_start_date,
      contract_completion_date,
      current_status,
      inspection_date,
      inspection_team,
      lead_inspector,
      remarks,
    } = req.body;

    let resolvedOfficeId = office_id || null;
    if (!resolvedOfficeId && office_name?.trim()) {
      const existingOffice = await query(
        `SELECT id FROM offices WHERE LOWER(TRIM(name)) = LOWER(TRIM($1)) AND is_active = TRUE LIMIT 1`,
        [office_name.trim()]
      );

      if (existingOffice.rows.length > 0) {
        resolvedOfficeId = existingOffice.rows[0].id;
      } else {
        const createdOffice = await query(
          `INSERT INTO offices (name, is_active) VALUES ($1, TRUE) RETURNING id`,
          [office_name.trim()]
        );
        resolvedOfficeId = createdOffice.rows[0].id;
      }
    }

    // Validation
    if (!title || !procurement_type || !procurement_method || !resolvedOfficeId || !fiscal_year_id) {
      res.status(400).json({
        error: 'कृपया अनिवार्य विवरणहरू (खरिद शीर्षक, खरिद प्रकार, खरिद विधि, कार्यालय र आर्थिक वर्ष) भर्नुहोस्।',
      });
      return;
    }

    // Auto-generate unique procurement ID code
    const countRes = await query('SELECT COUNT(*) FROM procurements');
    const seq = parseInt(countRes.rows[0].count, 10) + 1;
    const procurement_id_code = `NVC-PROC-2083-${String(seq).padStart(3, '0')}`;

    const insertSql = `
      INSERT INTO procurements (
        procurement_id_code, procurement_number, office_id, ministry_id, province_id, district_id,
        municipality_id, ward, title, procurement_type, procurement_method, fiscal_year_id,
        budget_source, estimated_cost, contract_amount, contract_number, contract_date,
        contractor_name, contract_start_date, contract_completion_date, current_status,
        inspection_date, inspection_team, lead_inspector, remarks, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23, $24, $25, $26
      ) RETURNING *
    `;

    const values = [
      procurement_id_code,
      procurement_number || `PROC-REF-${Date.now().toString().slice(-6)}`,
      resolvedOfficeId,
      ministry_id || null,
      province_id || null,
      district_id || null,
      municipality_id || null,
      ward || null,
      title.trim(),
      procurement_type,
      procurement_method,
      fiscal_year_id,
      budget_source || 'नेपाल सरकार (GoN)',
      estimated_cost ? parseFloat(estimated_cost) : 0,
      contract_amount ? parseFloat(contract_amount) : 0,
      contract_number || null,
      contract_date || null,
      contractor_name ? contractor_name.trim() : null,
      contract_start_date || null,
      contract_completion_date || null,
      current_status || 'संचालनमा',
      inspection_date || null,
      inspection_team || null,
      lead_inspector || req.user!.full_name,
      remarks || null,
      req.user!.id,
    ];

    const result = await query(insertSql, values);
    const newProc = result.rows[0];

    // Seed default file checklist items for this procurement
    const defaultDocs = [
      'खरिद माग फाराम तथा औचित्य',
      'बजेट विनियोजन तथा स्रोत सहमति पत्र',
      'विस्तृत लागत अनुमान तथा दर विश्लेषण',
      'स्वीकृत खरिद योजना (वार्षिक/गुरुयोजना)',
      'मानक बोलपत्र कागजात (SBD) / दरभाउपत्र फाराम',
      'बोलपत्र आह्वानको राष्ट्रिय सूचना',
      'पूर्व-बोलपत्र बैठकको माइन्युट र स्पष्टीकरण',
      'बोलपत्र खोल्ने मुचुल्का (Opening Minutes)',
      'मूल्याङ्कन समितिको प्रतिवेदन',
      'आशयको सूचना (LOI)',
      'कार्यसम्पादन बैंक जमानत (Performance Guarantee)',
      'द्विपक्षीय सम्झौता पत्र',
      'बीमा पोलिसी तथा स्वीकृत कार्यतालिका',
      'साइट हस्तान्तरण मुचुल्का तथा कार्यादेश',
      'प्रयोगशाला परीक्षण प्रतिवेदन (Lab Reports)',
      'नापी किताब (Measurement Book - MB)',
      'रनिङ बिल तथा भुक्तानी भौचर',
      'भेरिएसन अर्डर तथा म्याद थप कागजात (लागू हुने भएमा)',
      'सार्वजनिक परीक्षण मुचुल्का तथा आयोजना बोर्ड',
    ];

    for (const docTitle of defaultDocs) {
      await query(
        `INSERT INTO procurement_documents (procurement_id, document_title, status)
         VALUES ($1, $2, 'उपलब्ध छैन')`,
        [newProc.id, docTitle]
      );
    }

    // Automatically create the initial Inspection record
    const inspCountRes = await query('SELECT COUNT(*) FROM inspections');
    const inspSeq = parseInt(inspCountRes.rows[0].count, 10) + 1;
    const inspection_code = `INSP-2083-${String(inspSeq).padStart(3, '0')}`;

    await query(
      `INSERT INTO inspections (inspection_code, procurement_id, inspection_date, status, lead_inspector_id, inspection_team, created_by)
       VALUES ($1, $2, CURRENT_DATE, 'Draft', $3, $4, $5)`,
      [
        inspection_code,
        newProc.id,
        req.user!.id,
        lead_inspector || req.user!.full_name,
        req.user!.id,
      ]
    );

    await logAudit(
      req.user!.id,
      req.user!.username,
      'CREATE_PROCUREMENT',
      'Procurement',
      newProc.id,
      null,
      newProc,
      req.ip || '127.0.0.1'
    );

    res.status(201).json(newProc);
  } catch (err: any) {
    console.error('Create procurement error:', err);
    res.status(500).json({ error: 'खरिद दर्ता गर्न सकिएन: ' + (err.message || '') });
  }
});

// Update Procurement
router.put('/:id', authenticate, requireRole(['admin', 'inspector', 'reviewer']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const curRes = await query('SELECT * FROM procurements WHERE id = $1', [id]);
    if (curRes.rows.length === 0) {
      res.status(404).json({ error: 'खरिद अभिलेख फेला परेन।' });
      return;
    }
    const oldProc = curRes.rows[0];

    const {
      procurement_number,
      office_id,
      ministry_id,
      province_id,
      district_id,
      municipality_id,
      ward,
      title,
      procurement_type,
      procurement_method,
      fiscal_year_id,
      budget_source,
      estimated_cost,
      contract_amount,
      contract_number,
      contract_date,
      contractor_name,
      contract_start_date,
      contract_completion_date,
      current_status,
      inspection_date,
      inspection_team,
      lead_inspector,
      remarks,
    } = req.body;

    const updateSql = `
      UPDATE procurements
      SET procurement_number = COALESCE($1, procurement_number),
          office_id = COALESCE($2, office_id),
          ministry_id = $3,
          province_id = $4,
          district_id = $5,
          municipality_id = $6,
          ward = $7,
          title = COALESCE($8, title),
          procurement_type = COALESCE($9, procurement_type),
          procurement_method = COALESCE($10, procurement_method),
          fiscal_year_id = COALESCE($11, fiscal_year_id),
          budget_source = $12,
          estimated_cost = COALESCE($13, estimated_cost),
          contract_amount = COALESCE($14, contract_amount),
          contract_number = $15,
          contract_date = $16,
          contractor_name = $17,
          contract_start_date = $18,
          contract_completion_date = $19,
          current_status = COALESCE($20, current_status),
          inspection_date = $21,
          inspection_team = $22,
          lead_inspector = $23,
          remarks = $24,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $25
      RETURNING *
    `;

    const values = [
      procurement_number,
      office_id,
      ministry_id !== undefined ? ministry_id : oldProc.ministry_id,
      province_id !== undefined ? province_id : oldProc.province_id,
      district_id !== undefined ? district_id : oldProc.district_id,
      municipality_id !== undefined ? municipality_id : oldProc.municipality_id,
      ward !== undefined ? ward : oldProc.ward,
      title ? title.trim() : null,
      procurement_type,
      procurement_method,
      fiscal_year_id,
      budget_source !== undefined ? budget_source : oldProc.budget_source,
      estimated_cost ? parseFloat(estimated_cost) : null,
      contract_amount ? parseFloat(contract_amount) : null,
      contract_number !== undefined ? contract_number : oldProc.contract_number,
      contract_date || null,
      contractor_name !== undefined ? contractor_name : oldProc.contractor_name,
      contract_start_date || null,
      contract_completion_date || null,
      current_status,
      inspection_date || null,
      inspection_team !== undefined ? inspection_team : oldProc.inspection_team,
      lead_inspector !== undefined ? lead_inspector : oldProc.lead_inspector,
      remarks !== undefined ? remarks : oldProc.remarks,
      id,
    ];

    const result = await query(updateSql, values);

    await logAudit(
      req.user!.id,
      req.user!.username,
      'UPDATE_PROCUREMENT',
      'Procurement',
      id,
      oldProc,
      result.rows[0],
      req.ip || '127.0.0.1'
    );

    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Update procurement error:', err);
    res.status(500).json({ error: 'खरिद अद्यावधिक गर्न सकिएन।' });
  }
});

// Update Procurement Document Status
router.put('/:id/documents/:docId', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { docId } = req.params;
    const { status, remarks } = req.body;
    const result = await query(
      `UPDATE procurement_documents
       SET status = COALESCE($1, status),
           remarks = COALESCE($2, remarks),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, remarks, docId]
    );

    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: 'कागजात स्थिति अद्यावधिक गर्न सकिएन।' });
  }
});

export default router;
