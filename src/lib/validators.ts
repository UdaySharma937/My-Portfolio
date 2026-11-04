import { z } from "zod";

/** Shared (client + server) contact form schema. `website` is a honeypot: humans leave it empty. */
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(200),
  subject: z.string().trim().max(150).optional().default(""),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000),
  website: z.string().max(0).optional().default(""),
  turnstileToken: z.string().max(4096).optional().default(""),
});
export type ContactInput = z.input<typeof contactSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(200),
});
