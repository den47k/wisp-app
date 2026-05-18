import {
  AuthenticatedUserSchema,
  LoginResponseSchema,
  RegisterStartResponseSchema,
  RegisterVerifyEmailResponseSchema,
  RegisterProfileResponseSchema,
  SuggestTagResponseSchema,
  type LoginRequest,
  type LoginResponse,
  type RegisterStartRequest,
  type RegisterStartResponse,
  type RegisterVerifyEmailRequest,
  type RegisterProfileRequest,
  type RegisterProfileResponse,
  type SuggestTagResponse,
  type AuthenticatedUser,
} from "@chat/domain";
import { request, type ApiClient } from "../client";

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
});
