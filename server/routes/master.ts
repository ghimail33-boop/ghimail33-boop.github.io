import { Router, Request, Response } from 'express';
import { query } from '../db.ts';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth.ts';
import { logAudit } from '../utils/audit.ts';

const router = Router();

// Get checklist stages (All 34 stages), प्रत्येक चरणका सक्रिय बुँदा संख्या सहित
router.get('/stages', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT cs.*, COUNT(ci.id) as checklist_items_count
       FROM checklist_stages cs
       LEFT JOIN checklist_items ci ON cs.id = ci.stage_id AND ci.is_active = TRUE
       GROUP BY cs.id
       ORDER BY cs.sort_order ASC`
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: 'चरणहरूको विवरण लोड गर्न सकिएन।' });
  }
});

// Get provinces
router.get('/provinces', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT * FROM provinces ORDER BY id ASC');
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: 'प्रदेश विवरण लोड गर्न सकिएन।' });
  }
});

// Get districts
router.get('/districts', async (req: Request, res: Response): Promise<void> => {
  try {
    const { province_id } = req.query;
    let sql = 'SELECT * FROM districts';
    const params: any[] = [];
    if (province_id) {
      sql += ' WHERE province_id = $1';
      params.push(province_id);
    }
    sql += ' ORDER BY name_ne ASC';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: 'जिल्ला विवरण लोड गर्न सकिएन।' });
  }
});

// Get municipalities
router.get('/municipalities', async (req: Request, res: Response): Promise<void> => {
  try {
    const { district_id } = req.query;
    let sql = 'SELECT * FROM municipalities';
    const params: any[] = [];
    if (district_id) {
      sql += ' WHERE district_id = $1';
      params.push(district_id);
    }
    sql += ' ORDER BY name_ne ASC';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: 'स्थानीय तह विवरण लोड गर्न सकिएन।' });
  }
});

// Get ministries
router.get('/ministries', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT * FROM ministries ORDER BY id ASC');
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: 'मन्त्रालय विवरण लोड गर्न सकिएन।' });
  }
});

// Get offices
router.get('/offices', async (req: Request, res: Response): Promise<void> => {
  try {
    const { ministry_id, province_id } = req.query;
    let sql = `
      SELECT o.*, m.name_ne as ministry_name, p.name_ne as province_name, d.name_ne as district_name
      FROM offices o
      LEFT JOIN ministries m ON o.ministry_id = m.id
      LEFT JOIN provinces p ON o.province_id = p.id
      LEFT JOIN districts d ON o.district_id = d.id
      WHERE o.is_active = TRUE
    `;
    const params: any[] = [];
    if (ministry_id) {
      params.push(ministry_id);
      sql += ` AND o.ministry_id = $${params.length}`;
    }
    if (province_id) {
      params.push(province_id);
      sql += ` AND o.province_id = $${params.length}`;
    }
    sql += ' ORDER BY o.name ASC';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: 'कार्यालय विवरण लोड गर्न सकिएन।' });
  }
});

// Create new office
router.post('/offices', authenticate, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, code, ministry_id, province_id, district_id, address } = req.body;
    if (!name) {
      res.status(400).json({ error: 'कार्यालयको नाम अनिवार्य छ।' });
      return;
    }
    const result = await query(
      `INSERT INTO offices (name, code, ministry_id, province_id, district_id, address)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name.trim(), code ? code.trim() : null, ministry_id || null, province_id || null, district_id || null, address || null]
    );

    await logAudit(
      req.user!.id,
      req.user!.username,
      'CREATE_OFFICE',
      'Office',
      result.rows[0].id,
      null,
      result.rows[0],
      req.ip || '127.0.0.1'
    );

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: 'कार्यालय थप गर्न सकिएन।' });
  }
});

// Get fiscal years
router.get('/fiscal-years', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT * FROM fiscal_years ORDER BY id DESC');
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: 'आर्थिक वर्ष विवरण लोड गर्न सकिएन।' });
  }
});

// Get roles
router.get('/roles', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT * FROM roles ORDER BY id ASC');
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: 'भूमिका विवरण लोड गर्न सकिएन।' });
  }
});

export default router;
