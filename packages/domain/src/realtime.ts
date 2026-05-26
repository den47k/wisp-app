import { z } from "zod";
import { ConversationSchema } from "./conversation";
import { MessageSchema } from "./message";

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

export const RealtimeEnvelopeSchema = z.object({
  event: z.string(),
  data: z.unknown(),
});

export const MessageEventPayloadSchema = z.object({
  message: MessageSchema,
});

export const MessageDeletedPayloadSchema = z.object({
  conversationId: z.string().uuid(),
  deletedId: z.string().uuid(),
  wasLastMessage: z.boolean(),
  newLastMessage: MessageSchema.nullable(),
  hasUnread: z.boolean(),
});

export const ConversationCreatedPayloadSchema = z.object({
  conversation: ConversationSchema,
});

export const ConversationDeletedPayloadSchema = z.object({
  id: z.string().uuid(),
});

export type RealtimeEnvelope = z.infer<typeof RealtimeEnvelopeSchema>;
export type MessageEventPayload = z.infer<typeof MessageEventPayloadSchema>;
export type MessageDeletedPayload = z.infer<typeof MessageDeletedPayloadSchema>;
export type ConversationCreatedPayload = z.infer<typeof ConversationCreatedPayloadSchema>;
export type ConversationDeletedPayload = z.infer<typeof ConversationDeletedPayloadSchema>;

export type RealtimeEventName =
  | "MessageCreatedEvent"
  | "MessageUpdatedEvent"
  | "MessageDeletedEvent"
  | "ConversationCreated"
  | "ConversationDeleted";
