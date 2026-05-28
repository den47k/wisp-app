import { useEffect, useRef, useState } from "react";
import { Avatar, ConfirmDialog, IconButton } from "@chat/ui";
import type { Conversation, Message } from "@chat/domain";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { Composer } from "./Composer";
import { ChatPaneSkeleton } from "./ChatPaneSkeleton";

interface ChatPaneProps {
  conversation: Conversation;
  messages: Message[];
  typing?: boolean;
  isLoading?: boolean;
  onSend: (text: string) => void;
  onEditMessage?: (msg: Message) => void;
  onDeleteMessage?: (msg: Message) => void;
  sendDisabled?: boolean;
  editingId?: string | null;
  editingDraft?: string;
  onChangeEditing?: (v: string) => void;
  onSubmitEdit?: (text: string) => void;
  onCancelEdit?: () => void;
}

export const ChatPane = ({
  conversation,
  messages,
  typing,
  isLoading,
  onSend,
  onEditMessage,
  onDeleteMessage,
  sendDisabled,
  editingId,
  editingDraft,
  onChangeEditing,
  onSubmitEdit,
  onCancelEdit,
}: ChatPaneProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Message | null>(null);
  const isGroup = conversation.type === "group";
  const title = conversation.title ?? "Conversation";
  const editing = editingId != null;

  useEffect(() => {
    setPendingDelete(null);
  }, [conversation.id]);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    onDeleteMessage?.(pendingDelete);
    setPendingDelete(null);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing, conversation.id]);

  const placeholder = editing
    ? "Edit message…"
    : `Message ${isGroup ? title : title.split(" ")[0]}…`;

  return (
    <section className="wh-chat">
      <header className="wh-chat-hd">
        <div className="wh-chat-hd-left">
          <Avatar size={36} name={title} seed={conversation.id} group={isGroup} />
          <div>
            <div className="wh-chat-name">{title}</div>
            <div className="wh-chat-sub">
              {isGroup
                ? `${conversation.participants.length} members`
                : conversation.userTag
                  ? `@${conversation.userTag}`
                  : "Direct message"}
            </div>
          </div>
        </div>
        <div className="wh-chat-hd-right">
          <IconButton icon="search" label="Search in chat" />
          <IconButton icon="dots" label="More" />
        </div>
      </header>

      {isLoading ? (
        <ChatPaneSkeleton />
      ) : (
        <div className="wh-chat-scroll" ref={scrollRef}>
          <div className="wh-day-sep">
            <span>Today</span>
          </div>
          {messages.map((m, i) => (
            <MessageBubble
              key={m.id}
              message={m}
              prev={messages[i - 1]}
              next={messages[i + 1]}
              conversation={conversation}
              onEdit={onEditMessage}
              onDelete={setPendingDelete}
            />
          ))}
          {typing && <TypingIndicator conversation={conversation} />}
        </div>
      )}

      {editing ? (
        <Composer
          placeholder={placeholder}
          value={editingDraft ?? ""}
          onChange={onChangeEditing}
          onSend={(t) => onSubmitEdit?.(t)}
          onCancel={onCancelEdit}
          submitLabel="Save"
          disabled={sendDisabled}
        />
      ) : (
        <Composer
          placeholder={placeholder}
          onSend={onSend}
          disabled={sendDisabled}
          focusKey={conversation.id}
        />
      )}

      <ConfirmDialog
        open={pendingDelete != null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Delete this message?"
        description="It will be removed for everyone in this chat. This can't be undone."
        confirmLabel="Delete"
      />
    </section>
  );
};
