import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { query } from '../db.ts';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.ts';
import { logAudit } from '../utils/audit.ts';

const router = Router();

const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `EVD-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, uniqueName);
  },
});

// File filter
const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.mp3', '.mp4'];
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('अमान्य फाइल ढाँचा। स्वीकृत ढाँचा: PDF, DOC, XLS, JPG, PNG, MP3, MP4'));
    }
  },
});

// List evidence for an inspection / checklist item
router.get('/inspections/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { checklist_item_id } = req.query;

    let sql = `
      SELECT ef.*, ci.checklist_code, ci.inspection_area, u.full_name as uploader_name
      FROM evidence_files ef
      LEFT JOIN checklist_items ci ON ef.checklist_item_id = ci.id
      LEFT JOIN users u ON ef.uploaded_by = u.id
      WHERE ef.inspection_id = $1
    `;
    const params: any[] = [id];
    if (checklist_item_id) {
      params.push(checklist_item_id);
      sql += ` AND ef.checklist_item_id = $${params.length}`;
    }
    sql += ' ORDER BY ef.id DESC';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: 'प्रमाण फाइलहरू लोड गर्न सकिएन।' });
  }
});

// Upload evidence file
router.post('/upload', authenticate, upload.single('file') as any, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'कृपया फाइल चयन गर्नुहोस्।' });
      return;
    }

    const {
      inspection_id,
      checklist_item_id,
      document_number,
      document_date,
      page_number,
      description,
    } = req.body;

    if (!inspection_id) {
      res.status(400).json({ error: 'निरीक्षण ID अनिवार्य छ।' });
      return;
    }

    const result = await query(
      `INSERT INTO evidence_files (
        inspection_id, checklist_item_id, file_name, stored_file_name, file_path,
        file_size, file_type, document_number, document_date, page_number,
        description, uploaded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        inspection_id,
        checklist_item_id || null,
        file.originalname,
        file.filename,
        `/uploads/${file.filename}`,
        file.size,
        file.mimetype,
        document_number || null,
        document_date || null,
        page_number || null,
        description || null,
        req.user!.id,
      ]
    );

    const newEvidence = result.rows[0];

    await logAudit(
      req.user!.id,
      req.user!.username,
      'UPLOAD_EVIDENCE',
      'EvidenceFile',
      newEvidence.id,
      null,
      { file_name: file.originalname, inspection_id, checklist_item_id },
      req.ip || '127.0.0.1'
    );

    res.status(201).json(newEvidence);
  } catch (err: any) {
    console.error('Upload evidence error:', err);
    res.status(500).json({ error: 'प्रमाण फाइल अपलोड गर्न सकिएन: ' + (err.message || '') });
  }
});

// Download / Serve file
router.get('/file/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM evidence_files WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'फाइल फेला परेन।' });
      return;
    }
    const ef = result.rows[0];
    const fullPath = path.join(uploadsDir, ef.stored_file_name);
    if (!fs.existsSync(fullPath)) {
      res.status(404).json({ error: 'फाइल डिस्कमा फेला परेन।' });
      return;
    }

    res.download(fullPath, ef.file_name);
  } catch (err: any) {
    res.status(500).json({ error: 'फाइल डाउनलोड गर्दा त्रुटि भयो।' });
  }
});

// Delete evidence file
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM evidence_files WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'फाइल फेला परेन।' });
      return;
    }
    const ef = result.rows[0];

    // Delete disk file
    const fullPath = path.join(uploadsDir, ef.stored_file_name);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    await query('DELETE FROM evidence_files WHERE id = $1', [id]);

    await logAudit(
      req.user!.id,
      req.user!.username,
      'DELETE_EVIDENCE',
      'EvidenceFile',
      id,
      ef,
      null,
      req.ip || '127.0.0.1'
    );

    res.json({ success: true, message: 'प्रमाण फाइल हटाइयो।' });
  } catch (err: any) {
    res.status(500).json({ error: 'फाइल हटाउन सकिएन।' });
  }
});

export default router;
