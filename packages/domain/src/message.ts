import { z } from "zod";
import { UserSchema } from "./user";

export const MessageAttachmentSchema = z.object({
  id: z.string().uuid(),
  data: z.unknown().nullable(),
  urls: z.record(z.string()).nullable(),
});

export const MessageSchema = z.object({
  id: z.string().uuid(),
  content: z.string().nullable(),
  conversationId: z.string().uuid(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  sender: UserSchema,
  attachment: MessageAttachmentSchema.nullable(),
});

export const SendMessageRequestSchema = z.object({
  content: z.string(),
  parent_id: z.string().uuid().optional(),
});

export const PaginatedMessagesSchema = z.object({
  data: z.array(MessageSchema),
  links: z
    .object({ next: z.string().nullable() })
    .passthrough()
    .optional(),
  meta: z
    .object({ next_cursor: z.string().nullable().optional() })
    .passthrough()
    .optional(),
});

export const UpdateMessageResponseSchema = z.object({
  data: MessageSchema,
});

export const DeleteMessageResponseSchema = z.object({
  data: z.object({
    conversationId: z.string().uuid(),
    deletedId: z.string().uuid(),
    wasLastMessage: z.boolean(),
    newLastMessage: MessageSchema.nullable(),
  }),
});

export type Message = z.infer<typeof MessageSchema>;
export type MessageAttachment = z.infer<typeof MessageAttachmentSchema>;
export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;
export type PaginatedMessages = z.infer<typeof PaginatedMessagesSchema>;
export type UpdateMessageResponse = z.infer<typeof UpdateMessageResponseSchema>;
export type DeleteMessageResponse = z.infer<typeof DeleteMessageResponseSchema>;
