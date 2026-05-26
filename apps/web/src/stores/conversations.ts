import { create } from "zustand";
import type { Conversation, Message } from "@chat/domain";

export type ConversationsStatus = "idle" | "loading" | "ready" | "error";

interface ConversationsState {
  items: Conversation[];
  byId: Record<string, Conversation>;
  byTag: Record<string, string>;
  ephemeral: Conversation | null;
  status: ConversationsStatus;
  nextCursor: string | null;
  error: string | null;
  setStatus: (status: ConversationsStatus, error?: string | null) => void;
  setAll: (list: Conversation[], nextCursor: string | null) => void;
  upsert: (c: Conversation) => void;
  setEphemeral: (c: Conversation | null) => void;
  remove: (id: string) => void;
  applyDeletedLastMessage: (conversationId: string, newLastMessage: Message | null) => void;
  patchLastMessage: (conversationId: string, msg: Message) => void;
  setHasUnread: (conversationId: string, hasUnread: boolean) => void;
  clear: () => void;
}

const indexItems = (items: Conversation[]) => {
  const byId: Record<string, Conversation> = {};
  const byTag: Record<string, string> = {};
  for (const c of items) {
    byId[c.id] = c;
    if (c.userTag) byTag[c.userTag] = c.id;
  }
  return { byId, byTag };
};

const sortByUpdatedDesc = (items: Conversation[]) =>
  [...items].sort((a, b) => {
    const ka = a.lastMessage?.createdAt ?? a.createdAt;
    const kb = b.lastMessage?.createdAt ?? b.createdAt;
    return ka < kb ? 1 : ka > kb ? -1 : 0;
  });

export const useConversationsStore = create<ConversationsState>((set) => ({
  items: [],
  byId: {},
  byTag: {},
  ephemeral: null,
  status: "idle",
  nextCursor: null,
  error: null,
  setStatus: (status, error = null) => set({ status, error }),
  setAll: (list, nextCursor) => {
    const items = sortByUpdatedDesc(list);
    set({ items, nextCursor, status: "ready", error: null, ...indexItems(items) });
  },
  upsert: (c) =>
    set((s) => {
      const exists = s.byId[c.id] !== undefined;
      const items = sortByUpdatedDesc(
        exists ? s.items.map((it) => (it.id === c.id ? c : it)) : [c, ...s.items],
      );
      return { items, ...indexItems(items) };
    }),
  setEphemeral: (c) => set({ ephemeral: c }),
  remove: (id) =>
    set((s) => {
      const items = s.items.filter((c) => c.id !== id);
      return { items, ...indexItems(items) };
    }),
  applyDeletedLastMessage: (conversationId, newLastMessage) =>
    set((s) => {
      const existing = s.byId[conversationId];
      if (!existing) return s;
      const patched: Conversation = { ...existing, lastMessage: newLastMessage };
      const items = s.items.map((it) => (it.id === conversationId ? patched : it));
      return { items, ...indexItems(items) };
    }),
  patchLastMessage: (conversationId, msg) =>
    set((s) => {
      const existing = s.byId[conversationId];
      if (!existing) return s;
      if (existing.lastMessage?.id !== msg.id) return s;
      const patched: Conversation = { ...existing, lastMessage: msg };
      const items = s.items.map((it) => (it.id === conversationId ? patched : it));
      return { items, ...indexItems(items) };
    }),
  setHasUnread: (conversationId, hasUnread) =>
    set((s) => {
      const existing = s.byId[conversationId];
      if (!existing || existing.hasUnread === hasUnread) return s;
      const patched: Conversation = { ...existing, hasUnread };
      const items = s.items.map((it) => (it.id === conversationId ? patched : it));
      return { items, ...indexItems(items) };
    }),
  clear: () =>
    set({
      items: [],
      byId: {},
      byTag: {},
      ephemeral: null,
      status: "idle",
      nextCursor: null,
      error: null,
    }),
}));

const matchEphemeral = (e: Conversation | null, identifier: string): Conversation | null => {
  if (!e) return null;
  if (e.id === identifier) return e;
  if (e.userTag && e.userTag === identifier) return e;
  return null;
};

export const selectAll = (s: ConversationsState) => s.items;
export const selectById = (id: string | null | undefined) => (s: ConversationsState) =>
  id ? (s.byId[id] ?? null) : null;
export const selectByTag = (tag: string | null | undefined) => (s: ConversationsState) => {
  if (!tag) return null;
  const id = s.byTag[tag];
  return id ? (s.byId[id] ?? null) : null;
};
export const selectByIdentifier =
  (identifier: string | null | undefined) => (s: ConversationsState) => {
    if (!identifier) return null;
    const viaTag = s.byTag[identifier];
    if (viaTag) return s.byId[viaTag] ?? null;
    const direct = s.byId[identifier];
    if (direct) return direct;
    return matchEphemeral(s.ephemeral, identifier);
  };
