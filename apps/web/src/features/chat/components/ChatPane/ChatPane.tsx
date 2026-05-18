import { useEffect, useRef } from "react";
import { Avatar, IconButton } from "@chat/ui";
import type { ChatConversation, ChatMessage } from "../../types";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { Composer } from "./Composer";

interface ChatPaneProps {
  conversation: ChatConversation;
  messages: ChatMessage[];
  typing?: boolean;
  onSend: (text: string) => void;
}

export const ChatPane = ({ conversation, messages, typing, onSend }: ChatPaneProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing, conversation.id]);

  const placeholder = `Message ${
    conversation.group ? conversation.name : conversation.name.split(" ")[0]
  }…`;

  return (
    <section className="wh-chat">
      <header className="wh-chat-hd">
        <div className="wh-chat-hd-left">
          <Avatar
            gradientIdx={conversation.avatarIdx}
            size={36}
            name={conversation.name}
            online={conversation.online}
            group={conversation.group}
          />
          <div>
            <div className="wh-chat-name">
              {conversation.name}
              {conversation.online && <span className="wh-online-text">· online</span>}
            </div>
            <div className="wh-chat-sub">
              {conversation.group
                ? `${conversation.members ?? 0} members`
                : conversation.username
                  ? `@${conversation.username}`
                  : "Direct message"}
            </div>
          </div>
        </div>
        <div className="wh-chat-hd-right">
          <IconButton icon="search" label="Search in chat" />
          <IconButton icon="dots" label="More" />
        </div>
      </header>

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
          />
        ))}
        {typing && <TypingIndicator conversation={conversation} />}
      </div>

      <Composer placeholder={placeholder} onSend={onSend} />
    </section>
  );
};
