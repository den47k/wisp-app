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
  editedAt: z.string().datetime({ offset: true }).nullable(),
  createdAt: z.string().datetime({ offset: true }),
  sender: UserSchema,
  attachment: MessageAttachmentSchema.nullable(),
});

export const SendMessageRequestSchema = z.object({
  content: z.string(),
  parent_id: z.string().uuid().optional(),
});

export type Message = z.infer<typeof MessageSchema>;
export type MessageAttachment = z.infer<typeof MessageAttachmentSchema>;
export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;
