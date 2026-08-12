import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import customerRoutes from './routes/customerRoutes';
import productRoutes from './routes/productRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import challanRoutes from './routes/challanRoutes';
import { sendError, sendSuccess } from './utils/response';

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL || '',
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());

// API Health Check
app.get('/api/health', (req: Request, res: Response) => {
  return sendSuccess(res, { status: 'healthy', timestamp: new Date().toISOString() }, 'Mini ERP + CRM API Server is running');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api', inventoryRoutes);
app.use('/api/challans', challanRoutes);

// 404 Route Handler
app.use((req: Request, res: Response) => {
  return sendError(res, `Route '${req.originalUrl}' not found.`, 404);
});

// Global Error Handling Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  return sendError(res, err.message || 'Internal Server Error', 500);
});

export default app;
