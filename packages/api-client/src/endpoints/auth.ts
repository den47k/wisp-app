import { z } from "zod";
import {
  AuthenticatedUserSchema,
  LoginResponseSchema,
  RegisterStartResponseSchema,
  RegisterVerifyEmailResponseSchema,
  RegisterProfileResponseSchema,
  type LoginRequest,
  type LoginResponse,
  type RegisterStartResponse,
  type RegisterProfileResponse,
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

  registerStart: (body: { email: string }): Promise<RegisterStartResponse> =>
    request(client, "/auth/register/start", RegisterStartResponseSchema, {
      method: "POST",
      data: body,
    }),

  registerVerifyEmail: (body: { code: string }, registrationToken: string) =>
    request(client, "/auth/register/verify-email", RegisterVerifyEmailResponseSchema, {
      method: "POST",
      data: body,
      headers: { Authorization: `Bearer ${registrationToken}` },
    }),

  registerProfile: (
    body: { name: string; tag: string; password: string },
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

  suggestTag: (name: string): Promise<{ tag: string }> =>
    request(
      client,
      "/auth/register/suggest-tag",
      z.object({ tag: z.string() }),
      { method: "GET", params: { name } },
    ),
});
