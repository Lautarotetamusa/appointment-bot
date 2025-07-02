import { eq, and, SQLWrapper, sql } from 'drizzle-orm';
import { db } from '../db';
import { Request, Response } from 'express';
import { CreateSchedule, createScheduleSchema, scheduleFilterSchema, scheduleSchema } from '../schema/schedule';
import { professionalSchema } from '../schema/professional';

async function checkScheduleOverlap(s: CreateSchedule): Promise<boolean> {
    // Check for overlap: (start1 < end2 AND end1 > start2)
    // where start1/end1 are the proposed times, and start2/end2 are existing schedule times.
    // Drizzle's `time` type might require `sql` for robust string comparisons if direct comparison doesn't work as expected with HH:MM:SS strings.
    const conditions: SQLWrapper[] = [
        eq(scheduleSchema.professionalId, s.professionalId),
        eq(scheduleSchema.dayOfWeek, s.dayOfWeek),
        sql`'${s.startTime}' < ${scheduleSchema.endTime} AND '${s.endTime}' > ${scheduleSchema.startTime}`
    ];

    const existingOverlaps = await db.select()
        .from(scheduleSchema)
        .where(and(...conditions))
        .limit(1);

    return existingOverlaps.length > 0;
}

export const createSchedule = async (req: Request, res: Response) => {
    const data = createScheduleSchema.parse(req.body);

    const [professional] = await db.select()
        .from(professionalSchema)
        .where(eq(professionalSchema.id, data.professionalId))
        .limit(1);
    if (!professional) {
        return res.status(404).json({ message: 'Professional not found.' });
    }

    const hasOverlap = await checkScheduleOverlap(data);
    if (hasOverlap) {
      return res.status(409).json({
          message: 'The proposed schedule overlaps with an existing schedule for this professional on this day.' 
      }); 
    }

    if (data.startTime >= data.endTime) {
        return res.status(400).json({ message: 'Start time must be before end time.' });
    }

    const [insertedSchedule] = await db.insert(scheduleSchema).values(data).returning();

    res.status(201).json({
        message: 'Professional schedule created successfully', 
        schedule: insertedSchedule
    });
};

/**
* @param req Express Request object (query: professionalId - optional)
**/
export const getSchedules = async (req: Request, res: Response) => {
    const { professionalId } = scheduleFilterSchema.parse(req.query);

    const schedules = await db.select()
        .from(scheduleSchema)
        .where(
            and(
                professionalId ? eq(scheduleSchema.professionalId, professionalId) : undefined,
            )
        )

    if (schedules.length === 0) {
        return res.status(200).json({
            message: 'No professional schedules found.', 
            schedules: [] 
        });
    }

    res.status(200).json(schedules);
};
