import { z } from "zod";
import { UserSchema, AvatarSchema } from "./user";
import { MessageSchema } from "./message";

export const ConversationTypeSchema = z.enum(["private"]);

export const ConversationSchema = z.object({
  id: z.string().uuid(),
  userTag: z.string().optional(),
  title: z.string().nullable(),
  description: z.string().nullable().optional(),
  lastMessage: MessageSchema.nullable(),
  hasUnread: z.boolean(),
  avatar: AvatarSchema,
  type: ConversationTypeSchema,
  participants: z.array(UserSchema),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const CreatePrivateConversationRequestSchema = z.object({
  tag: z.string().min(1),
});

export type Conversation = z.infer<typeof ConversationSchema>;
export type ConversationType = z.infer<typeof ConversationTypeSchema>;
