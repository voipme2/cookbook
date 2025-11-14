import express, { Express, Request, Response, NextFunction } from 'express';
import cookbookdb from './data/cookbookdb';
import recipes from './routes/recipes';
import groups from './routes/groups';
import imageRoutes from './routes/imageRoutes';
import cors from 'cors';

// Create Express app
const app: Express = express();

// Configure CORS with environment-based origin control
const allowedOrigins = process.env['ALLOWED_ORIGINS']
  ? process.env['ALLOWED_ORIGINS'].split(',').map(origin => origin.trim())
  : [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
    ];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api', recipes(cookbookdb));
app.use('/api', groups(cookbookdb));
app.use('/api/images', imageRoutes);

// Catch-all 404 handler
app.use((req: Request, res: Response, _next: NextFunction) => {
  console.error(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Global error handler:', err.stack || err);
  res.status(500).json({ error: 'Internal server error', details: err.message || err });
});

const PORT = process.env['PORT'] || 3001;
app.listen(PORT, () => {
  // console.log(`cookbook is running on port ${PORT}`);
});

export default app; 