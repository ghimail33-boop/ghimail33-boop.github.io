import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.ts';
import { authenticate, generateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.ts';
import { logAudit } from '../utils/audit.ts';

const router = Router();

// Login
router.post('/login', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: 'प्रयोगकर्ता नाम र पासवर्ड अनिवार्य छन्।' });
      return;
    }

    const result = await query(
      `SELECT u.*, r.display_name as role_display_name, o.name as office_name
       FROM users u
       LEFT JOIN roles r ON u.role = r.name
       LEFT JOIN offices o ON u.office_id = o.id
       WHERE u.username = $1 AND u.is_active = TRUE`,
      [username.trim()]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'गलत प्रयोगकर्ता नाम वा पासवर्ड।' });
      return;
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      res.status(401).json({ error: 'गलत प्रयोगकर्ता नाम वा पासवर्ड।' });
      return;
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      designation: user.designation,
      office_id: user.office_id,
    });

    await logAudit(
      user.id,
      user.username,
      'USER_LOGIN',
      'User',
      user.id,
      null,
      { username: user.username, role: user.role },
      req.ip || '127.0.0.1'
    );

    res.json({
      message: 'लगइन सफल भयो।',
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        role_display_name: user.role_display_name,
        designation: user.designation,
        phone: user.phone,
        office_id: user.office_id,
        office_name: user.office_name,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'लगइन गर्दा प्राविधिक समस्या उत्पन्न भयो।' });
  }
});

// Get current user profile
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT u.id, u.username, u.full_name, u.email, u.role, u.designation, u.phone, u.office_id,
              r.display_name as role_display_name, o.name as office_name
       FROM users u
       LEFT JOIN roles r ON u.role = r.name
       LEFT JOIN offices o ON u.office_id = o.id
       WHERE u.id = $1 AND u.is_active = TRUE`,
      [req.user!.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'प्रयोगकर्ता फेला परेन।' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: 'प्रयोगकर्ता विवरण प्राप्त गर्न सकिएन।' });
  }
});

// List users (Admin only)
router.get('/users', authenticate, requireRole(['admin']), async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT u.id, u.username, u.full_name, u.email, u.role, u.designation, u.phone, u.is_active, u.created_at,
              r.display_name as role_display_name, o.name as office_name
       FROM users u
       LEFT JOIN roles r ON u.role = r.name
       LEFT JOIN offices o ON u.office_id = o.id
       ORDER BY u.id ASC`
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: 'प्रयोगकर्ता सूची प्राप्त गर्न सकिएन।' });
  }
});

// Create user (Admin only)
router.post('/users', authenticate, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { username, password, full_name, email, role, designation, phone, office_id } = req.body;
    if (!username || !password || !full_name || !email || !role) {
      res.status(400).json({ error: 'आवश्यक विवरणहरू (username, password, full_name, email, role) पूरा गर्नुहोस्।' });
      return;
    }

    const existing = await query('SELECT id FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (existing.rows.length > 0) {
      res.status(400).json({ error: 'यो प्रयोगकर्ता नाम वा इमेल पहिले नै दर्ता भइसकेको छ।' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (username, password_hash, full_name, email, role, designation, phone, office_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, username, full_name, email, role, designation, phone, is_active, created_at`,
      [username.trim(), passwordHash, full_name.trim(), email.trim(), role, designation || null, phone || null, office_id || null]
    );

    const newUser = result.rows[0];
    await logAudit(
      req.user!.id,
      req.user!.username,
      'CREATE_USER',
      'User',
      newUser.id,
      null,
      newUser,
      req.ip || '127.0.0.1'
    );

    res.status(201).json(newUser);
  } catch (err: any) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'नयाँ प्रयोगकर्ता सिर्जना गर्न सकिएन।' });
  }
});

// Update user (Admin only)
router.put('/users/:id', authenticate, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { full_name, email, role, designation, phone, office_id, is_active, password } = req.body;

    const currentRes = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (currentRes.rows.length === 0) {
      res.status(404).json({ error: 'प्रयोगकर्ता फेला परेन।' });
      return;
    }
    const oldUser = currentRes.rows[0];

    let passwordHash = oldUser.password_hash;
    if (password && password.trim().length > 0) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const result = await query(
      `UPDATE users
       SET full_name = COALESCE($1, full_name),
           email = COALESCE($2, email),
           role = COALESCE($3, role),
           designation = COALESCE($4, designation),
           phone = COALESCE($5, phone),
           office_id = $6,
           is_active = COALESCE($7, is_active),
           password_hash = $8,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING id, username, full_name, email, role, designation, phone, is_active, updated_at`,
      [
        full_name,
        email,
        role,
        designation,
        phone,
        office_id !== undefined ? office_id : oldUser.office_id,
        is_active,
        passwordHash,
        id,
      ]
    );

    await logAudit(
      req.user!.id,
      req.user!.username,
      'UPDATE_USER',
      'User',
      id,
      oldUser,
      result.rows[0],
      req.ip || '127.0.0.1'
    );

    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'प्रयोगकर्ता अद्यावधिक गर्न सकिएन।' });
  }
});

export default router;
