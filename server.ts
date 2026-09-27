import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDb } from './server/db.ts';

import authRouter from './server/routes/auth.ts';
import masterRouter from './server/routes/master.ts';
import procurementsRouter from './server/routes/procurements.ts';
import checklistsRouter from './server/routes/checklists.ts';
import inspectionsRouter from './server/routes/inspections.ts';
import findingsRouter from './server/routes/findings.ts';
import correctiveActionsRouter from './server/routes/correctiveActions.ts';
import evidenceRouter from './server/routes/evidence.ts';
import dashboardRouter from './server/routes/dashboard.ts';
import reportsRouter from './server/routes/reports.ts';
import auditLogsRouter from './server/routes/auditLogs.ts';
import geminiRouter from './server/routes/gemini.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Database
  console.log('[NVC SERVER] Initializing Database...');
  await initDb();
  console.log('[NVC SERVER] Database Initialized Successfully.');

  // Express middleware
  app.use(cors());
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Uploads directory
  const uploadsDir = path.resolve(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // Mount API routes
  app.use('/api/auth', authRouter);
  app.use('/api/master', masterRouter);
  app.use('/api/procurements', procurementsRouter);
  app.use('/api/checklists', checklistsRouter);
  app.use('/api/inspections', inspectionsRouter);
  app.use('/api/findings', findingsRouter);
  app.use('/api/corrective-actions', correctiveActionsRouter);
  app.use('/api/evidence', evidenceRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/reports', reportsRouter);
  app.use('/api/audit-logs', auditLogsRouter);
  app.use('/api/gemini', geminiRouter);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'UP',
      system: 'NVC Public Procurement Monitoring & Inspection System',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Vite integration
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NVC SERVER] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[NVC SERVER] Fatal Startup Error:', err);
  process.exit(1);
});
