import { z } from "zod";
import { AuthenticatedUserSchema } from "./user";

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  device_name: z.string().optional(),
});

export const LoginSuccessSchema = z.object({
  user: AuthenticatedUserSchema,
  token: z.string(),
  token_type: z.literal("Bearer"),
  device_id: z.string().uuid(),
});

export const Login2FARequiredSchema = z.object({
  requires_2fa: z.literal(true),
  challenge_token: z.string(),
  token_type: z.literal("Bearer"),
  expires_in: z.number(),
});

export const LoginResponseSchema = z.union([LoginSuccessSchema, Login2FARequiredSchema]);

export const RegisterStartRequestSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8, "At least 8 characters"),
    password_confirmation: z.string().min(8, "At least 8 characters"),
  })
  .refine((d) => d.password === d.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match",
  });

export const RegisterStartResponseSchema = z.object({
  registration_token: z.string(),
  token_type: z.literal("Bearer"),
  expires_in: z.number(),
  email: z.string().email(),
});

export const RegisterVerifyEmailRequestSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export const RegisterVerifyEmailResponseSchema = z.object({
  status: z.literal("pending_profile"),
});

export const RegisterProfileRequestSchema = z.object({
  name: z.string().min(3, "At least 3 characters").max(32, "Up to 32 characters"),
  tag: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]{4,31}$/, "5–32 chars · letter first · a–z, 0–9, _"),
  device_name: z.string().max(128),
});

export const RegisterProfileResponseSchema = LoginSuccessSchema;

export const SuggestTagResponseSchema = z.object({
  suggestions: z.array(z.string()),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginSuccess = z.infer<typeof LoginSuccessSchema>;
export type Login2FARequired = z.infer<typeof Login2FARequiredSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RegisterStartRequest = z.infer<typeof RegisterStartRequestSchema>;
export type RegisterStartResponse = z.infer<typeof RegisterStartResponseSchema>;
export type RegisterVerifyEmailRequest = z.infer<typeof RegisterVerifyEmailRequestSchema>;
export type RegisterProfileRequest = z.infer<typeof RegisterProfileRequestSchema>;
export type RegisterProfileResponse = z.infer<typeof RegisterProfileResponseSchema>;
export type SuggestTagResponse = z.infer<typeof SuggestTagResponseSchema>;

export const isLoginSuccess = (r: LoginResponse): r is LoginSuccess => "token" in r;
