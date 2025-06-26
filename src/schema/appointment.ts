import { pgTable, integer, timestamp, date, time } from 'drizzle-orm/pg-core';
import { clientSchema } from './client';
import { professionalSchema } from './professional';
import { serviceSchema } from './service';
import { z } from 'zod';

export const appointmentSchema = pgTable('appointment', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),

    clientId: integer('client_id').notNull()
        .references(() => clientSchema.id, { onDelete: 'restrict' }), // Don't delete client if they have appointments
    professionalId: integer('professional_id').notNull()
        .references(() => professionalSchema.id, { onDelete: 'restrict' }), // Don't delete professional if they have appointments
    serviceId: integer('service_id').notNull()
        .references(() => serviceSchema.id, { onDelete: 'restrict' }), // Don't delete service if it has active appointments

    date: date('date', { mode: 'date' }).notNull(), // Mode: 'date' => The variable is a Date object
    startTime: time('start_time', { withTimezone: false }).notNull(),
    endTime: time('end_time', { withTimezone: false }).notNull(),
    // status: varchar('status', { length: 50 }).notNull().default('PENDING'), // e.g., 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'RESCHEDULED'
    // notes: text('notes'),
    // isReminderSent: boolean('is_reminder_sent').default(false).notNull(), // To track if reminder has been sent
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const appointmentFilterSchema = z.object({
    professionalId: z.string().optional().transform(transformIntQueryParam),
    serviceId: z.string().optional().transform(transformIntQueryParam),
});

function transformIntQueryParam(param: string | undefined): number | undefined {
    if (param === undefined) return undefined;
    const parsedInt = parseInt(param, 10);
    return isNaN(parsedInt) ? undefined : parsedInt;
}
