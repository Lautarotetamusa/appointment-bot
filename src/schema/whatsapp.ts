import { z } from "zod";

const whatsappPhoneSchema = z.string().trim()
    .min(5, 'WhatsApp phone must be at least 5 characters')
    .max(20, 'WhatsApp phone cannot exceed 20 characters')
    .regex(/^\+?[0-9\s().-]*$/, 'Invalid WhatsApp phone format. Only digits, spaces, parentheses, hyphens, and an optional leading "+" are allowed.');
