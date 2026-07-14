import { z } from "zod";

// ==========================================
// Auth Validation Schemas
// ==========================================
export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters" })
      .max(100, { message: "Name must be less than 100 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[0-9]/, {
        message: "Password must contain at least one number",
      }),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

// ==========================================
// Job Description Validation
// ==========================================
export const jobDescriptionSchema = z.object({
  job_title: z
    .string()
    .min(2, { message: "Job title must be at least 2 characters" })
    .max(200, { message: "Job title must be less than 200 characters" }),
  company_name: z
    .string()
    .max(200, { message: "Company name must be less than 200 characters" })
    .optional()
    .or(z.literal("")),
  raw_text: z
    .string()
    .min(100, {
      message: "Job description must be at least 100 characters for meaningful analysis",
    })
    .max(50000, {
      message: "Job description must be less than 50,000 characters",
    }),
});

// ==========================================
// Interrogation Message Validation
// ==========================================
export const interrogationMessageSchema = z.object({
  content: z
    .string()
    .min(5, { message: "Please provide a more detailed answer" })
    .max(5000, { message: "Response must be less than 5,000 characters" }),
});

// ==========================================
// Inferred Types
// ==========================================
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type JobDescriptionFormValues = z.infer<typeof jobDescriptionSchema>;
export type InterrogationMessageValues = z.infer<typeof interrogationMessageSchema>;
