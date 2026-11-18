import {
  AuthenticatedUserResponseSchema,
  LoginResponseSchema,
  LoginSuccessSchema,
  MessageResponseSchema,
  OAuthCallbackResponseSchema,
  OAuthConfirmLinkResponseSchema,
  OAuthRedirectResponseSchema,
  RegisterStartResponseSchema,
  RegisterVerifyEmailResponseSchema,
  RegisterProfileResponseSchema,
  SuggestTagResponseSchema,
  TwoFactorEnableResponseSchema,
  RecoveryCodesResponseSchema,
  type ForgotPasswordRequest,
  type LoginRequest,
  type LoginResponse,
  type LoginSuccess,
  type MessageResponse,
  type OAuthCallbackResult,
  type OAuthConfirmLinkRequest,
  type OAuthConfirmLinkResult,
  type OAuthRedirectResponse,
  type RegisterStartRequest,
  type RegisterStartResponse,
  type RegisterVerifyEmailRequest,
  type RegisterProfileRequest,
  type RegisterProfileResponse,
  type ResetPasswordRequest,
  type SuggestTagResponse,
  type TwoFactorVerifyRequest,
  type TwoFactorConfirmRequest,
  type TwoFactorDisableRequest,
  type TwoFactorEnableResponse,
  type RecoveryCodesResponse,
  type AuthenticatedUser,
} from "@chat/domain";
import { request, type ApiClient } from "../client";

type Provider = "google" | "github";

export const authEndpoints = (client: ApiClient) => ({
  login: (body: LoginRequest): Promise<LoginResponse> =>
    request(client, "/auth/login", LoginResponseSchema, { method: "POST", data: body }),

  logout: async (): Promise<void> => {
    await client.post("/auth/logout");
  },

  logoutAll: async (): Promise<void> => {
    await client.post("/auth/logout/all");
  },

  me: async (): Promise<AuthenticatedUser> => {
    const res = await request(client, "/auth/me", AuthenticatedUserResponseSchema, { method: "GET" });
    return res.data;
  },

  registerStart: (body: RegisterStartRequest): Promise<RegisterStartResponse> =>
    request(client, "/auth/register/start", RegisterStartResponseSchema, {
      method: "POST",
      data: body,
    }),

  registerVerifyEmail: (body: RegisterVerifyEmailRequest, registrationToken: string) =>
    request(client, "/auth/register/verify-email", RegisterVerifyEmailResponseSchema, {
      method: "POST",
      data: body,
      headers: { Authorization: `Bearer ${registrationToken}` },
    }),

  registerProfile: (
    body: RegisterProfileRequest,
    registrationToken: string,
  ): Promise<RegisterProfileResponse> =>
    request(client, "/auth/register/profile", RegisterProfileResponseSchema, {
      method: "POST",
      data: body,
      headers: { Authorization: `Bearer ${registrationToken}` },
    }),

  registerResendOtp: async (registrationToken: string): Promise<void> => {
    await client.post(
      "/auth/register/resend-otp",
      {},
      { headers: { Authorization: `Bearer ${registrationToken}` } },
    );
  },

  suggestTag: (registrationToken: string): Promise<SuggestTagResponse> =>
    request(client, "/auth/register/suggest-tag", SuggestTagResponseSchema, {
      method: "GET",
      headers: { Authorization: `Bearer ${registrationToken}` },
    }),

  twoFactorVerify: (body: TwoFactorVerifyRequest, challengeToken: string): Promise<LoginSuccess> =>
    request(client, "/auth/2fa/verify", LoginSuccessSchema, {
      method: "POST",
      data: body,
      headers: { Authorization: `Bearer ${challengeToken}` },
    }),

  twoFactorEnable: (): Promise<TwoFactorEnableResponse> =>
    request(client, "/auth/2fa/enable", TwoFactorEnableResponseSchema, { method: "POST" }),

  twoFactorConfirm: (body: TwoFactorConfirmRequest): Promise<RecoveryCodesResponse> =>
    request(client, "/auth/2fa/confirm", RecoveryCodesResponseSchema, {
      method: "POST",
      data: body,
    }),

  twoFactorDisable: (body: TwoFactorDisableRequest): Promise<MessageResponse> =>
    request(client, "/auth/2fa/disable", MessageResponseSchema, {
      method: "POST",
      data: body,
    }),

  twoFactorRecoveryCodes: (body: TwoFactorDisableRequest): Promise<RecoveryCodesResponse> =>
    request(client, "/auth/2fa/recovery-codes", RecoveryCodesResponseSchema, {
      method: "POST",
      data: body,
    }),

  forgotPassword: (body: ForgotPasswordRequest): Promise<MessageResponse> =>
    request(client, "/auth/password/forgot", MessageResponseSchema, {
      method: "POST",
      data: body,
    }),

  resetPassword: (body: ResetPasswordRequest): Promise<MessageResponse> =>
    request(client, "/auth/password/reset", MessageResponseSchema, {
      method: "POST",
      data: body,
    }),

  oauthRedirect: (provider: Provider): Promise<OAuthRedirectResponse> =>
    request(client, `/auth/oauth/${provider}/redirect`, OAuthRedirectResponseSchema, {
      method: "GET",
    }),

  oauthCallback: (
    provider: Provider,
    query: { code?: string; state?: string; device_name?: string },
  ): Promise<OAuthCallbackResult> =>
    request(client, `/auth/oauth/${provider}/callback`, OAuthCallbackResponseSchema, {
      method: "GET",
      params: query,
    }),

  oauthConfirmLink: (
    provider: Provider,
    body: OAuthConfirmLinkRequest,
    linkToken: string,
  ): Promise<OAuthConfirmLinkResult> =>
    request(client, `/auth/oauth/${provider}/link/confirm`, OAuthConfirmLinkResponseSchema, {
      method: "POST",
      data: body,
      headers: { Authorization: `Bearer ${linkToken}` },
    }),
});
