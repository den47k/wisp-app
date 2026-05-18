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

export const RegisterStartRequestSchema = z.object({
  email: z.string().email(),
});

export const RegisterStartResponseSchema = z.object({
  registration_token: z.string(),
  token_type: z.literal("Bearer"),
  expires_in: z.number(),
  email: z.string().email(),
});

export const RegisterVerifyEmailRequestSchema = z.object({
  code: z.string(),
});

export const RegisterVerifyEmailResponseSchema = z.object({
  status: z.literal("pending_profile"),
});

export const RegisterProfileRequestSchema = z.object({
  name: z.string().min(1),
  tag: z.string().min(1),
  password: z.string().min(8),
});

export const RegisterProfileResponseSchema = LoginSuccessSchema;

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginSuccess = z.infer<typeof LoginSuccessSchema>;
export type Login2FARequired = z.infer<typeof Login2FARequiredSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RegisterStartResponse = z.infer<typeof RegisterStartResponseSchema>;
export type RegisterProfileResponse = z.infer<typeof RegisterProfileResponseSchema>;

export const isLoginSuccess = (r: LoginResponse): r is LoginSuccess => "token" in r;
