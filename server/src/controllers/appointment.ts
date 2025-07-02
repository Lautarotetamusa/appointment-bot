import { Request, Response } from 'express';
import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { appointmentFilterSchema, appointmentSchema } from '../schema/appointment';

export const getAllAppointments = async (req: Request, res: Response) => {
    const {professionalId, serviceId} = appointmentFilterSchema.parse(req.query);

    const result = await db.select()
        .from(appointmentSchema)
        .where(
            and(
                professionalId ? eq(appointmentSchema.professionalId, professionalId) : undefined,
                serviceId ? eq(appointmentSchema.serviceId, serviceId) : undefined
            )
        )

    res.status(200).json({
        filters: {
             professionalId,
             serviceId
        },
        data: result
    })
}
