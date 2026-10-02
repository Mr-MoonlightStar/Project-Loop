import { z } from "zod";

/**
 * Password complexity validation rules:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter (A-Z)")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter (a-z)")
  .regex(/[0-9]/, "Password must contain at least one number (0-9)")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character (!@#$%^&*...)"
  );

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address (e.g. you@company.com)"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address (e.g. you@company.com)"),
  password: passwordSchema,
  workspaceName: z.string().min(2, "Workspace name must be at least 2 characters"),
});

export type SignupFormData = z.infer<typeof signupSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
