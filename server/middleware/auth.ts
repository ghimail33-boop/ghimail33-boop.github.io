import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nvc-procurement-secret-key-2081-nepal';

export interface AuthUser {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: string;
  designation?: string;
  office_id?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      designation: user.designation,
      office_id: user.office_id,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query?.token) {
    token = req.query.token as string;
  }

  if (!token) {
    res.status(401).json({ error: 'अनधिकृत पहुँच: कृपया पहिले लगइन गर्नुहोस्।' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'लगइन सत्र समाप्त भएको छ वा अमान्य छ। कृपया पुनः लगइन गर्नुहोस्।' });
  }
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
      req.user = decoded;
    } catch {
      // ignore
    }
  }
  next();
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'कृपया पहिले लगइन गर्नुहोस्।' });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'यो कार्य सम्पादन गर्ने तपाईंलाई अनुमति छैन।' });
      return;
    }
    next();
  };
}
