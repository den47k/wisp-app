import {
  AuthenticatedUserSchema,
  LoginResponseSchema,
  LoginSuccessSchema,
  MessageResponseSchema,
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

  me: (): Promise<AuthenticatedUser> =>
    request(client, "/user", AuthenticatedUserSchema, { method: "GET" }),

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
    request(client, "/forgot-password", MessageResponseSchema, {
      method: "POST",
      data: body,
    }),

  resetPassword: (body: ResetPasswordRequest): Promise<MessageResponse> =>
    request(client, "/reset-password", MessageResponseSchema, {
      method: "POST",
      data: body,
    }),

  oauthRedirect: (provider: Provider): Promise<OAuthRedirectResponse> =>
    request(client, `/auth/oauth/${provider}/redirect`, OAuthRedirectResponseSchema, {
      method: "GET",
    }),

  oauthCallback: async (
    provider: Provider,
    query: { code?: string; state?: string; device_name?: string },
  ): Promise<OAuthCallbackResult> => {
    const res = await client.request({
      url: `/auth/oauth/${provider}/callback`,
      method: "GET",
      params: query,
      validateStatus: (s) => s === 200 || s === 409,
    });
    const data = res.data as Record<string, unknown>;
    if (res.status === 409 && data.status === "link_required") {
      return {
        kind: "link_required",
        link_token: data.link_token as string,
        token_type: "Bearer",
        expires_in: data.expires_in as number,
      };
    }
    if (data.status === "pending_email" || data.status === "pending_profile") {
      return {
        kind: data.status,
        registration_token: data.registration_token as string,
        token_type: "Bearer",
        expires_in: data.expires_in as number,
      };
    }
    return { kind: "logged_in", ...(data as unknown as LoginSuccess) };
  },

  oauthConfirmLink: async (
    provider: Provider,
    body: OAuthConfirmLinkRequest,
    linkToken: string,
  ): Promise<OAuthConfirmLinkResult> => {
    const res = await client.request({
      url: `/auth/oauth/${provider}/link/confirm`,
      method: "POST",
      data: body,
      headers: { Authorization: `Bearer ${linkToken}` },
    });
    const data = res.data as Record<string, unknown>;
    if (data.status === "pending_email" || data.status === "pending_profile") {
      return {
        kind: data.status,
        registration_token: data.registration_token as string,
        token_type: "Bearer",
        expires_in: data.expires_in as number,
      };
    }
    return { kind: "logged_in", ...(data as unknown as LoginSuccess) };
  },
});
