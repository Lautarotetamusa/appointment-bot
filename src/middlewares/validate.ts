import { Request, Response, NextFunction } from 'express';
import { z, AnyZodObject } from 'zod';

export const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error: any) {
        next(error);
    }
};
