import { pgTable, integer, varchar, text } from 'drizzle-orm/pg-core';
import { z } from 'zod';

export const serviceSchema = pgTable('service', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    title: varchar('title', { length: 100 }).notNull(),
    description: text('description'),
    duration: integer('duration').notNull(), // Duration in minutes
});

export type Service = typeof serviceSchema.$inferSelect;

export const createServiceSchema = z.object({
    title: z.string().max(100, "Title cannot exceed 100 characters"), 
    description: z.string().optional(),
    duration: z.number().int()
});
