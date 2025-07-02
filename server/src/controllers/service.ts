import { Request, Response } from 'express';
import { db } from '../db';
import { createServiceSchema, serviceSchema } from '../schema/service';

export const getAllServices = async (req: Request, res: Response) => {
    const services = await db.select().from(serviceSchema);
    res.status(200).json({
        length: services.length,
        data: services
    });
};

export const createService = async (req: Request, res: Response) => {
    const serviceData = createServiceSchema.parse(req.body);

    const [result] = await db.insert(serviceSchema)
       .values(serviceData)
       .returning({id: serviceSchema.id});

    res.status(201).json({
        message: 'Service created successfully', 
        service: {...serviceData, id: result.id}
    });
};
