import { pgTable, integer, time, timestamp } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { timeStringSchema, transformIntQueryParam } from './util';
import { professionalSchema } from './professional';

export const scheduleSchema = pgTable('schedule', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),

    professionalId: integer('professional_id').notNull()
        .references(() => professionalSchema.id, { onDelete: 'cascade' }),
    dayOfWeek: integer('day_of_week').notNull(),
    startTime: time('start_time', { withTimezone: false }).notNull(), 
    endTime: time('end_time', { withTimezone: false }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const createScheduleSchema = z.object({
    professionalId: z.number().int().positive('Professional ID must be a positive integer'),
    dayOfWeek: z.number().int()
        .min(0, 'Day of week must be between 0 (Sunday) and 6 (Saturday)')
        .max(6, 'Day of week must be between 0 (Sunday) and 6 (Saturday)'),
    startTime: timeStringSchema,
    endTime: timeStringSchema,
});

export type CreateSchedule = z.infer<typeof createScheduleSchema>;

export const updateScheduleSchema = createScheduleSchema.omit({
    professionalId: true,
}).partial();

const getProfessionalScheduleByIdSchema = z.object({
    id: z.string().regex(/^\d+$/, 'Schedule ID must be a number').transform(Number),
});

export const scheduleFilterSchema = z.object({
    professionalId: z.string().optional().transform(transformIntQueryParam),
});
