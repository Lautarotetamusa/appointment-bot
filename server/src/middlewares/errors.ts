import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function handleErrors(err: Error, req: Request, res: Response, next: NextFunction) { 
    console.error(err);
    if (err instanceof ZodError) {
        res.status(400).json({
            message: 'Validation failed',
            errors: err.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
        });
    }

    res.status(500).json({
        message: 'An unexpected error occurred',
        error: process.env.NODE_ENV === 'production' ? {} : err.message // Don't expose sensitive error details in production
    });
}
