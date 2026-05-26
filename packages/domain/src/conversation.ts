import { z } from "zod";
import { UserSchema, AvatarSchema } from "./user";
import { MessageSchema } from "./message";

export const ConversationTypeSchema = z.enum(["private", "group"]);

export const ConversationSchema = z.object({
  id: z.string().uuid(),
  userTag: z.string().optional(),
  title: z.string().nullable(),
  description: z.string().nullable().optional(),
  lastMessage: MessageSchema.nullish(),
  hasUnread: z.boolean(),
  avatar: AvatarSchema,
  type: ConversationTypeSchema,
  participants: z.array(UserSchema),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const CreatePrivateConversationRequestSchema = z.object({
  user_id: z.string().uuid(),
  should_join_now: z.boolean().optional(),
});

export const CreatePrivateConversationResponseSchema = z.object({
  message: z.string(),
  conversation: ConversationSchema,
});

export const PaginatedConversationsSchema = z.object({
  data: z.array(ConversationSchema),
  links: z
    .object({ next: z.string().nullable() })
    .passthrough()
    .optional(),
  meta: z
    .object({ next_cursor: z.string().nullable().optional() })
    .passthrough()
    .optional(),
});

export const SingleConversationSchema = z.object({
  data: ConversationSchema,
});

export const StoreMessageResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    message: MessageSchema,
    conversation: ConversationSchema,
  }),
});

export type Conversation = z.infer<typeof ConversationSchema>;
export type ConversationType = z.infer<typeof ConversationTypeSchema>;
export type CreatePrivateConversationRequest = z.infer<typeof CreatePrivateConversationRequestSchema>;
export type CreatePrivateConversationResponse = z.infer<typeof CreatePrivateConversationResponseSchema>;
export type PaginatedConversations = z.infer<typeof PaginatedConversationsSchema>;
export type StoreMessageResponse = z.infer<typeof StoreMessageResponseSchema>;
