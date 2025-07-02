import { pgTable, integer, varchar, timestamp } from 'drizzle-orm/pg-core';
import { z } from 'zod';

export const clientSchema = pgTable('client', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    whatsapp: varchar('whatsapp', { length: 20 }).unique().notNull(),
    email: varchar('email', { length: 100 }),
    registrationDate: timestamp('registration_date', { withTimezone: true }).defaultNow().notNull(),
});

export const createClientSchema = z.object({
    name: z.string().trim().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
    lastName: z.string().trim().max(100, 'Last name cannot exceed 100 characters'),
    whatsapp: z.string().trim().max(20, "Whatsapp phone cannot exceed 20 characters"),
    email: z.string().email('Invalid email format').max(100, 'Email cannot exceed 100 characters').optional(), 
});
