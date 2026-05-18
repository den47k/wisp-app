import { z } from "zod";

export const RealtimeTokenResponseSchema = z.object({
  token: z.string(),
  url: z.string(),
});

export const RealtimeSubscribeRequestSchema = z.object({
  channel: z.string(),
});

export const RealtimeSubscribeResponseSchema = z.object({
  token: z.string(),
  channel: z.string(),
});

export type RealtimeTokenResponse = z.infer<typeof RealtimeTokenResponseSchema>;
export type RealtimeSubscribeResponse = z.infer<typeof RealtimeSubscribeResponseSchema>;

export const userChannel = (userId: string) => `user:${userId}`;
export const conversationChannel = (conversationId: string) => `conv:${conversationId}`;
