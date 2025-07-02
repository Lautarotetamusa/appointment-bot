import { Request, Response } from 'express';
import { createProfessionalSchema, professionalSchema, professionalService } from '../schema/professional';
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { serviceSchema } from '../schema/service';

export const getAllProfessionals = async (req: Request, res: Response) => {
    const professionals = await db.select().from(professionalSchema);
    res.status(200).json({
        length: professionals.length,
        data: professionals
    });
};

export const getServices = async (req: Request, res: Response) => {
    const professionalId = parseInt(req.params.id, 10);

    const professionalExists = await db.select()
        .from(professionalSchema)
        .where(eq(professionalSchema.id, professionalId))
        .limit(1);

    if (professionalExists.length === 0) {
        res.status(404).json({
            message: 'Professional not found.'
        });
    }

    const professionalServicesList = await db
        .select({
            id: serviceSchema.id,
            serviceName: serviceSchema.title,
            durationMinutes: serviceSchema.duration,
            description: serviceSchema.description,
        })
        .from(professionalService)
        .innerJoin(serviceSchema, eq(professionalService.serviceId, serviceSchema.id))
        .where(eq(professionalService.professionalId, professionalId));

    if (professionalServicesList.length === 0) {
        res.status(200).json({
            message: 'This professional does not offer any services yet.', 
            services: []
        });
    }

    res.status(200).json(professionalServicesList);
}

export const assignServiceToProfessional = async (req: Request, res: Response) => {
    const profId = parseInt(req.params.profId, 10);
    const serviceId = parseInt(req.params.serviceId, 10);

    // Check if the professional exists
    const profExists = await db.select()
        .from(professionalSchema)
        .where(eq(professionalSchema.id, profId))
        .limit(1);

    if (profExists.length === 0) {
        res.status(404).json({
            message: 'Professional not found.'
        });
    }

    // Check if the service exists
    const serviceExists = await db.select()
        .from(serviceSchema)
        .where(eq(serviceSchema.id, serviceId))
        .limit(1);
    if (serviceExists.length === 0) {
        res.status(404).json({
            message: 'Service not found.'
        });
    }

    // Check if the service is already assigned to this professional
    const existingAssignment = await db.select()
        .from(professionalService)
        .where(and(
            eq(professionalService.professionalId, profId),
            eq(professionalService.serviceId, serviceId)
        ))
        .limit(1);

    if (existingAssignment.length > 0) {
        res.status(409).json({ message: 'This service is already assigned to this professional.' });
    }

    const [insertedAssignment] = await db
        .insert(professionalService)
        .values({
          professionalId: profId,
          serviceId: serviceId,
        }).returning();

    res.status(201).json({
        message: 'Service assigned to professional successfully',
        assignment: insertedAssignment
    });
};

export const getProfessionalById = async (req: Request, res: Response) => {
    const professionalId = parseInt(req.params.id, 10);
    const professional = await db.select()
        .from(professionalSchema)
        .where(eq(professionalSchema.id, professionalId))
        .limit(1);

    if (professional.length == 0) {
        res.status(404).json({
            message: `Professional with id ${professionalId} not found`
        });
    }

    res.status(200).json(professional[0]);
};

export const createProfessional = async (req: Request, res: Response) => {
    const professionalData = createProfessionalSchema.parse(req.body);

    const duplicatedWpp = await db.select()
        .from(professionalSchema)
        .where(eq(professionalSchema.whatsapp, professionalData.whatsapp))
        .limit(1);
    if (duplicatedWpp.length > 0) {
        res.status(409).json({
            message: `Professional with whatsapp number '${professionalData.whatsapp}' already exists`,
        })
    }

    const [insertedProfessional] = await db.insert(professionalSchema)
       .values(professionalData)
       .returning();

    res.status(201).json({
        message: 'Professional created successfully', 
        professional: insertedProfessional
    });
};
