import { create } from "zustand";
import type { Message } from "@chat/domain";

export type MessagesStatus = "idle" | "loading" | "ready" | "error";

interface MessagesState {
  byConversation: Record<string, Message[]>;
  byId: Record<string, Message>;
  nextCursorByConversation: Record<string, string | null>;
  statusByConversation: Record<string, MessagesStatus>;
  setStatus: (conversationId: string, status: MessagesStatus) => void;
  setMessages: (conversationId: string, list: Message[], nextCursor: string | null) => void;
  prependOlder: (conversationId: string, list: Message[], nextCursor: string | null) => void;
  upsertMessage: (conversationId: string, msg: Message) => void;
  removeMessage: (conversationId: string, messageId: string) => void;
  clear: () => void;
}

const sortByCreatedAsc = (items: Message[]) =>
  [...items].sort((a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0));

export const useMessagesStore = create<MessagesState>((set) => ({
  byConversation: {},
  byId: {},
  nextCursorByConversation: {},
  statusByConversation: {},
  setStatus: (conversationId, status) =>
    set((s) => ({
      statusByConversation: { ...s.statusByConversation, [conversationId]: status },
    })),
  setMessages: (conversationId, list, nextCursor) =>
    set((s) => {
      const sorted = sortByCreatedAsc(list);
      const byIdAdd: Record<string, Message> = { ...s.byId };
      for (const m of sorted) byIdAdd[m.id] = m;
      return {
        byConversation: { ...s.byConversation, [conversationId]: sorted },
        nextCursorByConversation: { ...s.nextCursorByConversation, [conversationId]: nextCursor },
        statusByConversation: { ...s.statusByConversation, [conversationId]: "ready" },
        byId: byIdAdd,
      };
    }),
  prependOlder: (conversationId, list, nextCursor) =>
    set((s) => {
      const existing = s.byConversation[conversationId] ?? [];
      const seen = new Set(existing.map((m) => m.id));
      const fresh = list.filter((m) => !seen.has(m.id));
      const merged = sortByCreatedAsc([...fresh, ...existing]);
      const byIdAdd: Record<string, Message> = { ...s.byId };
      for (const m of fresh) byIdAdd[m.id] = m;
      return {
        byConversation: { ...s.byConversation, [conversationId]: merged },
        nextCursorByConversation: { ...s.nextCursorByConversation, [conversationId]: nextCursor },
        byId: byIdAdd,
      };
    }),
  upsertMessage: (conversationId, msg) =>
    set((s) => {
      const existing = s.byConversation[conversationId] ?? [];
      const exists = existing.some((m) => m.id === msg.id);
      const merged = exists
        ? existing.map((m) => (m.id === msg.id ? msg : m))
        : sortByCreatedAsc([...existing, msg]);
      return {
        byConversation: { ...s.byConversation, [conversationId]: merged },
        byId: { ...s.byId, [msg.id]: msg },
      };
    }),
  removeMessage: (conversationId, messageId) =>
    set((s) => {
      const existing = s.byConversation[conversationId] ?? [];
      const next = existing.filter((m) => m.id !== messageId);
      const byIdNext = { ...s.byId };
      delete byIdNext[messageId];
      return {
        byConversation: { ...s.byConversation, [conversationId]: next },
        byId: byIdNext,
      };
    }),
  clear: () =>
    set({
      byConversation: {},
      byId: {},
      nextCursorByConversation: {},
      statusByConversation: {},
    }),
}));

const EMPTY_MESSAGES: Message[] = [];

export const selectMessages = (conversationId: string | null | undefined) =>
  (s: MessagesState): Message[] => {
    if (!conversationId) return EMPTY_MESSAGES;
    return s.byConversation[conversationId] ?? EMPTY_MESSAGES;
  };

export const selectMessagesStatus =
  (conversationId: string | null | undefined) =>
  (s: MessagesState): MessagesStatus => {
    if (!conversationId) return "idle";
    return s.statusByConversation[conversationId] ?? "idle";
  };
