import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { corsOptions } from './config/cors';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('dev'));

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: 'Shiv Furniture Budget System API is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api', routes);

// 404 Handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        status: 'error',
        message: `Route ${req.originalUrl} not found`
    });
});

// Global Error Handler
app.use(errorHandler);

export default app;
