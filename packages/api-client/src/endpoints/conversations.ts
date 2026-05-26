import {
  ConversationSchema,
  CreatePrivateConversationResponseSchema,
  DeleteMessageResponseSchema,
  PaginatedConversationsSchema,
  PaginatedMessagesSchema,
  SingleConversationSchema,
  StoreMessageResponseSchema,
  UpdateMessageResponseSchema,
  type Conversation,
  type DeleteMessageResponse,
  type Message,
  type SendMessageRequest,
  type StoreMessageResponse,
} from "@chat/domain";
import { request, type ApiClient } from "../client";

export interface ConversationsPage {
  items: Conversation[];
  nextCursor: string | null;
}

export interface MessagesPage {
  items: Message[];
  nextCursor: string | null;
}

const extractCursor = (links?: { next?: string | null } | undefined): string | null => {
  if (!links?.next) return null;
  const qIdx = links.next.indexOf("?");
  if (qIdx === -1) return null;
  const search = links.next.slice(qIdx + 1);
  for (const part of search.split("&")) {
    const [k, v] = part.split("=");
    if (k === "cursor" && v != null) return decodeURIComponent(v);
  }
  return null;
};

export const conversationEndpoints = (client: ApiClient) => ({
  list: async (params?: { cursor?: string }): Promise<ConversationsPage> => {
    const res = await request(client, "/conversations", PaginatedConversationsSchema, {
      method: "GET",
      params,
    });
    const nextCursor = res.meta?.next_cursor ?? extractCursor(res.links) ?? null;
    return { items: res.data, nextCursor };
  },

  getPrivate: async (tag: string): Promise<Conversation> => {
    const res = await request(
      client,
      `/conversations/private/${encodeURIComponent(tag)}`,
      SingleConversationSchema,
      { method: "GET" },
    );
    return res.data;
  },

  createPrivate: async (
    user_id: string,
    should_join_now: boolean = false,
  ): Promise<Conversation> => {
    const res = await request(
      client,
      "/conversations/private",
      CreatePrivateConversationResponseSchema,
      { method: "POST", data: { user_id, should_join_now } },
    );
    return res.conversation;
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/conversations/${id}`);
  },

  markAsRead: async (id: string): Promise<void> => {
    await client.post(`/conversations/${id}/mark-as-read`);
  },

  listMessages: async (
    id: string,
    params?: { cursor?: string; limit?: number },
  ): Promise<MessagesPage> => {
    const res = await request(
      client,
      `/conversations/${id}/messages`,
      PaginatedMessagesSchema,
      { method: "GET", params },
    );
    const nextCursor = res.meta?.next_cursor ?? extractCursor(res.links) ?? null;
    return { items: res.data, nextCursor };
  },

  sendMessage: async (
    id: string,
    body: SendMessageRequest,
  ): Promise<StoreMessageResponse["data"]> => {
    const res = await request(
      client,
      `/conversations/${id}/messages`,
      StoreMessageResponseSchema,
      { method: "POST", data: body },
    );
    return res.data;
  },

  updateMessage: async (
    conversationId: string,
    messageId: string,
    body: { content: string },
  ): Promise<Message> => {
    const res = await request(
      client,
      `/conversations/${conversationId}/messages/${messageId}`,
      UpdateMessageResponseSchema,
      { method: "PATCH", data: body },
    );
    return res.data;
  },

  deleteMessage: async (
    conversationId: string,
    messageId: string,
  ): Promise<DeleteMessageResponse> =>
    request(
      client,
      `/conversations/${conversationId}/messages/${messageId}`,
      DeleteMessageResponseSchema,
      { method: "DELETE" },
    ),
});
