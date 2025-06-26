import { pgTable, integer, varchar, timestamp, boolean, primaryKey } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { serviceSchema } from './service';

export const professionalSchema = pgTable('professional', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    email: varchar('email', { length: 100 }),
    whatsapp: varchar('whatsapp', { length: 20 }).unique().notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const createProfessionalSchema = z.object({
    name: z.string().trim().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
    lastName: z.string().trim().max(100, 'Last name cannot exceed 100 characters'),
    whatsapp: z.string().trim().max(20, "Whatsapp phone cannot exceed 20 characters"),
    email: z.string().email('Invalid email format').max(100, 'Email cannot exceed 100 characters').optional(), 
});

export const professionalService = pgTable(
    'professional_service', 
    {
    professionalId: integer('professional_id')
        .notNull()
        .references(() => professionalSchema.id, { onDelete: 'cascade' }),
    serviceId: integer('service_id')
        .notNull()
        .references(() => serviceSchema.id, { onDelete: 'cascade' }),
    }, 
    (t) => ({
        pk: primaryKey({ columns: [t.professionalId, t.serviceId] }),
    })
);
