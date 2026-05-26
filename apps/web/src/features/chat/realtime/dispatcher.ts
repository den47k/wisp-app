import {
  ConversationCreatedPayloadSchema,
  ConversationDeletedPayloadSchema,
  MessageDeletedPayloadSchema,
  MessageEventPayloadSchema,
  RealtimeEnvelopeSchema,
  type Conversation,
} from "@chat/domain";
import { useConversationsStore } from "@/stores/conversations";
import { useMessagesStore } from "@/stores/messages";

interface DispatchContext {
  currentUserId: string;
}

export const handleRealtimeEvent = (raw: unknown, ctx: DispatchContext): void => {
  const envelopeParsed = RealtimeEnvelopeSchema.safeParse(raw);
  if (!envelopeParsed.success) {
    console.warn("[realtime] invalid envelope", raw, envelopeParsed.error);
    return;
  }

  const { event, data } = envelopeParsed.data;

  switch (event) {
    case "MessageCreatedEvent": {
      const parsed = MessageEventPayloadSchema.safeParse(data);
      if (!parsed.success) return logParseError(event, parsed.error);
      const msg = parsed.data.message;
      const convoId = msg.conversationId;
      if (!convoId) return;

      const messagesStore = useMessagesStore.getState();
      messagesStore.upsertMessage(convoId, msg);

      const convStore = useConversationsStore.getState();
      const existing = convStore.byId[convoId];
      if (existing) {
        const hasUnread = msg.sender?.id !== ctx.currentUserId;
        const updated: Conversation = {
          ...existing,
          lastMessage: msg,
          updatedAt: msg.createdAt,
          hasUnread: hasUnread || existing.hasUnread,
        };
        convStore.upsert(updated);
      }
      return;
    }

    case "MessageUpdatedEvent": {
      const parsed = MessageEventPayloadSchema.safeParse(data);
      if (!parsed.success) return logParseError(event, parsed.error);
      const msg = parsed.data.message;
      const convoId = msg.conversationId;
      if (!convoId) return;

      useMessagesStore.getState().upsertMessage(convoId, msg);
      useConversationsStore.getState().patchLastMessage(convoId, msg);
      return;
    }

    case "MessageDeletedEvent": {
      const parsed = MessageDeletedPayloadSchema.safeParse(data);
      if (!parsed.success) return logParseError(event, parsed.error);
      const { conversationId, deletedId, wasLastMessage, newLastMessage, hasUnread } = parsed.data;

      useMessagesStore.getState().removeMessage(conversationId, deletedId);

      const convStore = useConversationsStore.getState();
      if (wasLastMessage) {
        convStore.applyDeletedLastMessage(conversationId, newLastMessage);
      }
      convStore.setHasUnread(conversationId, hasUnread);
      return;
    }

    case "ConversationCreated": {
      const parsed = ConversationCreatedPayloadSchema.safeParse(data);
      if (!parsed.success) return logParseError(event, parsed.error);
      useConversationsStore.getState().upsert(parsed.data.conversation);
      return;
    }

    case "ConversationDeleted": {
      const parsed = ConversationDeletedPayloadSchema.safeParse(data);
      if (!parsed.success) return logParseError(event, parsed.error);
      useConversationsStore.getState().remove(parsed.data.id);
      return;
    }

    default:
      console.warn("[realtime] unknown event", event, data);
  }
};

const logParseError = (event: string, error: unknown) => {
  console.error(`[realtime] failed to parse payload for ${event}`, error);
};
