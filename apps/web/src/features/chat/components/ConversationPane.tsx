import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useMutation } from "@tanstack/react-query";
import type { Message } from "@chat/domain";
import { conversationChannel } from "@chat/domain";
import { api } from "@/lib/api";
import { getRealtimeClient } from "@/lib/realtime";
import { useConversationsStore, selectByIdentifier } from "@/stores/conversations";
import { useMessagesStore, selectMessages } from "@/stores/messages";
import { handleRealtimeEvent } from "../realtime/dispatcher";
import { useAuthStore } from "@/stores/auth";
import { useMessagesQuery } from "../hooks/useMessagesQuery";
import { ChatPane } from "./ChatPane/ChatPane";

export const ConversationPane = () => {
  const { identifier } = useParams<{ identifier: string }>();
  const conversation = useConversationsStore(selectByIdentifier(identifier));
  const ephemeralId = useConversationsStore((s) => s.ephemeral?.id);
  const byId = useConversationsStore((s) => s.byId);
  const upsertConvo = useConversationsStore((s) => s.upsert);
  const setEphemeral = useConversationsStore((s) => s.setEphemeral);
  const applyDeletedLastMessage = useConversationsStore((s) => s.applyDeletedLastMessage);
  const patchLastMessage = useConversationsStore((s) => s.patchLastMessage);

  const messages = useMessagesStore(selectMessages(conversation?.id));
  const upsertMessage = useMessagesStore((s) => s.upsertMessage);
  const removeMessage = useMessagesStore((s) => s.removeMessage);

  const currentUserId = useAuthStore((s) => s.user?.id);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState("");

  const convoId = conversation?.id ?? null;
  const isEphemeral = convoId != null && convoId === ephemeralId && !byId[convoId];

  const messagesQuery = useMessagesQuery(isEphemeral ? null : convoId);
  const isLoadingMessages =
    !isEphemeral && !!convoId && messagesQuery.isPending && messages.length === 0;

  useEffect(() => {
    setEditingId(null);
    setEditingDraft("");
  }, [convoId]);

  useEffect(() => {
    if (!convoId || isEphemeral || !currentUserId) return;
    const rt = getRealtimeClient();
    rt.connect();
    const unsub = rt.subscribe(conversationChannel(convoId), {
      onPublication: (data) => handleRealtimeEvent(data, { currentUserId }),
    });
    return () => unsub();
  }, [convoId, isEphemeral, currentUserId]);

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      api.conversations.sendMessage(convoId as string, { content }),
    onSuccess: ({ message, conversation: updatedConvo }) => {
      upsertMessage(updatedConvo.id, message);
      upsertConvo(updatedConvo);
      if (ephemeralId === updatedConvo.id) setEphemeral(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ messageId, content }: { messageId: string; content: string }) =>
      api.conversations.updateMessage(convoId as string, messageId, { content }),
    onSuccess: (msg) => {
      const cid = msg.conversationId ?? convoId;
      if (!cid) return;
      upsertMessage(cid, msg);
      patchLastMessage(cid, msg);
      setEditingId(null);
      setEditingDraft("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (messageId: string) =>
      api.conversations.deleteMessage(convoId as string, messageId),
    onSuccess: (res) => {
      if (!convoId) return;
      removeMessage(convoId, res.deletedId);
      if (res.wasLastMessage) {
        applyDeletedLastMessage(convoId, res.newLastMessage);
      }
    },
  });

  if (!conversation) {
    return (
      <section className="wh-chat">
        <div className="wh-chat-scroll">
          <div className="wh-day-sep">
            <span>Conversation not found</span>
          </div>
        </div>
      </section>
    );
  }

  const handleSend = (text: string) => sendMutation.mutate(text);

  const handleEditMessage = (msg: Message) => {
    setEditingId(msg.id);
    setEditingDraft(msg.content ?? "");
  };

  const handleDeleteMessage = (msg: Message) => {
    if (!convoId) return;
    deleteMutation.mutate(msg.id);
  };

  const handleSubmitEdit = (text: string) => {
    if (!editingId) return;
    updateMutation.mutate({ messageId: editingId, content: text });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingDraft("");
  };

  return (
    <ChatPane
      conversation={conversation}
      messages={messages}
      isLoading={isLoadingMessages}
      onSend={handleSend}
      onEditMessage={handleEditMessage}
      onDeleteMessage={handleDeleteMessage}
      sendDisabled={sendMutation.isPending || updateMutation.isPending}
      editingId={editingId}
      editingDraft={editingDraft}
      onChangeEditing={setEditingDraft}
      onSubmitEdit={handleSubmitEdit}
      onCancelEdit={handleCancelEdit}
    />
  );
};
