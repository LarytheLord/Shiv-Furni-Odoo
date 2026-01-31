import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export interface AppError extends Error {
    statusCode?: number;
    status?: string;
    isOperational?: boolean;
    code?: string;
}

export const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const statusCode = err.statusCode || 500;
    const status = err.status || 'error';

    // Log error in development
    if (env.NODE_ENV === 'development') {
        console.error('ERROR 💥:', err);
    }

    // Prisma errors
    if (err.code === 'P2002') {
        res.status(409).json({
            status: 'error',
            message: 'A record with this value already exists'
        });
        return;
    }

    if (err.code === 'P2025') {
        res.status(404).json({
            status: 'error',
            message: 'Record not found'
        });
        return;
    }

    if (err.code === 'P2003') {
        res.status(400).json({
            status: 'error',
            message: 'Invalid reference. Related record does not exist'
        });
        return;
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        res.status(400).json({
            status: 'error',
            message: err.message
        });
        return;
    }

    // JWT errors are handled in authMiddleware

    // Default error response
    res.status(statusCode).json({
        status,
        message: err.isOperational ? err.message : 'Something went wrong',
        ...(env.NODE_ENV === 'development' && {
            error: err,
            stack: err.stack
        })
    });
};

// Custom error class
export class ApiError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export default errorHandler;
