import express, { Express } from 'express';
import cors from 'cors';
import routes from './routes';

const app: Express = express();

// Restrict CORS to frontend origin
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Main router
app.use('/api', routes);

export default app;
