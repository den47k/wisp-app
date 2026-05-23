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

export const LoginAccountInactiveSchema = z.object({
  message: z.string(),
  status: z.enum(["pending_email", "pending_profile"]),
});

export const TwoFactorVerifyRequestSchema = z
  .object({
    code: z
      .string()
      .regex(/^\d{6}$/, "Enter the 6-digit code")
      .optional()
      .or(z.literal("")),
    recovery_code: z.string().min(1).optional().or(z.literal("")),
    device_name: z.string().max(128),
  })
  .refine((d) => !!d.code || !!d.recovery_code, {
    path: ["code"],
    message: "Enter a code or recovery code",
  });

export const TwoFactorEnableResponseSchema = z.object({
  secret: z.string(),
  qr_uri: z.string(),
});

export const TwoFactorConfirmRequestSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export const RecoveryCodesResponseSchema = z.object({
  recovery_codes: z.array(z.string()),
});

export const TwoFactorDisableRequestSchema = z.object({
  password: z.string().min(1, "Enter your password"),
});

export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email(),
});

export const ResetPasswordRequestSchema = z
  .object({
    token: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8, "At least 8 characters"),
    password_confirmation: z.string().min(8, "At least 8 characters"),
  })
  .refine((d) => d.password === d.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match",
  });

export const MessageResponseSchema = z.object({ message: z.string() });

export const OAuthRedirectResponseSchema = z.object({ url: z.string().url() });

export const OAuthLinkRequiredSchema = z.object({
  status: z.literal("link_required"),
  link_token: z.string(),
  token_type: z.literal("Bearer"),
  expires_in: z.number(),
});

export const OAuthPendingRegistrationSchema = z.object({
  status: z.enum(["pending_email", "pending_profile"]),
  registration_token: z.string(),
  token_type: z.literal("Bearer"),
  expires_in: z.number(),
});

export const OAuthConfirmLinkRequestSchema = z.object({
  password: z.string().min(1),
  device_name: z.string().max(128),
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
export type LoginAccountInactive = z.infer<typeof LoginAccountInactiveSchema>;
export type TwoFactorVerifyRequest = z.infer<typeof TwoFactorVerifyRequestSchema>;
export type TwoFactorEnableResponse = z.infer<typeof TwoFactorEnableResponseSchema>;
export type TwoFactorConfirmRequest = z.infer<typeof TwoFactorConfirmRequestSchema>;
export type RecoveryCodesResponse = z.infer<typeof RecoveryCodesResponseSchema>;
export type TwoFactorDisableRequest = z.infer<typeof TwoFactorDisableRequestSchema>;
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
export type MessageResponse = z.infer<typeof MessageResponseSchema>;
export type OAuthRedirectResponse = z.infer<typeof OAuthRedirectResponseSchema>;
export type OAuthLinkRequired = z.infer<typeof OAuthLinkRequiredSchema>;
export type OAuthPendingRegistration = z.infer<typeof OAuthPendingRegistrationSchema>;
export type OAuthConfirmLinkRequest = z.infer<typeof OAuthConfirmLinkRequestSchema>;

export type OAuthCallbackResult =
  | ({ kind: "logged_in" } & LoginSuccess)
  | ({ kind: "2fa" } & Omit<Login2FARequired, "requires_2fa">)
  | ({ kind: "pending_email" | "pending_profile" } & Omit<OAuthPendingRegistration, "status">)
  | ({ kind: "link_required" } & Omit<OAuthLinkRequired, "status">);

export type OAuthConfirmLinkResult =
  | ({ kind: "logged_in" } & LoginSuccess)
  | ({ kind: "2fa" } & Omit<Login2FARequired, "requires_2fa">)
  | ({ kind: "pending_email" | "pending_profile" } & Omit<OAuthPendingRegistration, "status">);

export const isLoginSuccess = (r: LoginResponse): r is LoginSuccess => "token" in r;
