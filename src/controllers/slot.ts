import { Request, Response } from 'express';
import { db } from '../db';
import { appointmentSchema } from '../schema/appointment';
import { and, eq, gte, lte } from 'drizzle-orm';
import { Service, serviceSchema } from '../schema/service';

export const findSlots = async (req: Request, res: Response) => {
    const {serviceId} = req.query;
    const [service] = await db.select()
        .from(serviceSchema)
        .where(eq(serviceSchema.id, parseInt(serviceId as string, 10)))
        .limit(1);

    if (!service) {
        res.status(404).json({message: "Service not found"})
    }

    const slots = slotsByService(service);

    res.status(200).json(slots);
}

async function slotsByService(service: Service) {
    // We are looking for slots from now to 30 days in the future
    const now = new Date();
    const endSearchDate = new Date();
    endSearchDate.setDate(now.getDate() + 30);
    console.log(now, endSearchDate);

    const appointments = await db.select()
        .from(appointmentSchema)
        .where(and(
            eq(appointmentSchema.serviceId, service.id),
            gte(appointmentSchema.date, now),
            lte(appointmentSchema.date, endSearchDate) 
        ))
        .orderBy(appointmentSchema.startTime);

    // Sliding window aproch
    const availableSlots = [];
    for (let i = 0; i < appointments.length-1; i++) {
        const current = appointments[i];
        const next = appointments[i+1];

        // If the duration fits between next appoitment endTime and current appointment startTime we have an available slot
        const gap = timeToMinutes(next.startTime) - timeToMinutes(current.endTime);
        // Number of times then duration fits in the gap
        const fitting = Math.floor(gap / service.duration);

        for (let j = 0; j < fitting; j++) {
            availableSlots.push({
                startTime: timeToMinutes(current.startTime) + j * service.duration,
                endTime: timeToMinutes(current.startTime) + (j+1) * service.duration
            });
        }
    }

    return availableSlots;
}

function timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}
