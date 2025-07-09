import express, { Express, Request, Response, NextFunction } from 'express';
import cookbookdb from './data/cookbookdb';
import recipes from './routes/recipes';
import imageRoutes from './routes/imageRoutes';
import cors from 'cors';

// Create Express app
const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use((_req, res, next) => {
  res.header('Content-Type', 'application/json');
  next();
});

// Routes
app.use('/api', recipes(cookbookdb));
app.use('/api/images', imageRoutes);

// Catch-all 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  console.error(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error('Global error handler:', err.stack || err);
  res.status(500).json({ error: 'Internal server error', details: err.message || err });
});

const PORT = process.env['PORT'] || 3001;
app.listen(PORT, () => {
  // console.log(`cookbook is running on port ${PORT}`);
});

export default app; 