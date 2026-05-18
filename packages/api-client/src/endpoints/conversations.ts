import { z } from "zod";
import {
  ConversationSchema,
  MessageSchema,
  type Conversation,
  type Message,
  type SendMessageRequest,
} from "@chat/domain";
import { request, type ApiClient } from "../client";

const ConversationListSchema = z.array(ConversationSchema);
const MessageListSchema = z.array(MessageSchema);

export const conversationEndpoints = (client: ApiClient) => ({
  list: (): Promise<Conversation[]> =>
    request(client, "/conversations", ConversationListSchema, { method: "GET" }),

  getPrivate: (tag: string): Promise<Conversation> =>
    request(client, `/conversations/private/${encodeURIComponent(tag)}`, ConversationSchema, {
      method: "GET",
    }),

  createPrivate: (tag: string): Promise<Conversation> =>
    request(client, "/conversations/private", ConversationSchema, {
      method: "POST",
      data: { tag },
    }),

  delete: async (id: string): Promise<void> => {
    await client.delete(`/conversations/${id}`);
  },

  markAsRead: async (id: string): Promise<void> => {
    await client.post(`/conversations/${id}/mark-as-read`);
  },

  listMessages: (id: string, params?: { cursor?: string; limit?: number }): Promise<Message[]> =>
    request(client, `/conversations/${id}/messages`, MessageListSchema, {
      method: "GET",
      params,
    }),

  sendMessage: (id: string, body: SendMessageRequest): Promise<Message> =>
    request(client, `/conversations/${id}/messages`, MessageSchema, {
      method: "POST",
      data: body,
    }),

  updateMessage: (
    conversationId: string,
    messageId: string,
    body: { content: string },
  ): Promise<Message> =>
    request(client, `/conversations/${conversationId}/messages/${messageId}`, MessageSchema, {
      method: "PATCH",
      data: body,
    }),

  deleteMessage: async (conversationId: string, messageId: string): Promise<void> => {
    await client.delete(`/conversations/${conversationId}/messages/${messageId}`);
  },
});
