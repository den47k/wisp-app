import { useState, type MouseEvent } from "react";
import { Avatar, Icon, cn, type PopoverAnchor } from "@chat/ui";
import type { Conversation, Message } from "@chat/domain";
import { useAuthStore } from "@/stores/auth";
import { formatTime } from "../../utils/time";
import { MessageActions, type MessageAction } from "./MessageActions";

interface Props {
  message: Message;
  prev?: Message;
  next?: Message;
  conversation: Conversation;
  onEdit?: (msg: Message) => void;
  onDelete?: (msg: Message) => void;
}

const sameSender = (a?: Message, b?: Message) => !!a && !!b && a.sender?.id === b.sender?.id;

export const MessageBubble = ({
  message: m,
  prev,
  next,
  conversation: convo,
  onEdit,
  onDelete,
}: Props) => {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const isMe = !!currentUserId && m.sender?.id === currentUserId;
  const groupWithPrev = sameSender(prev, m);
  const groupWithNext = sameSender(next, m);
  const isGroup = convo.type === "group";
  const showAvatar = !isMe && !groupWithNext && isGroup;
  const showWho = !isMe && isGroup && !groupWithPrev;
  const senderName = m.sender?.name ?? "";
  const edited = m.updatedAt !== m.createdAt;

  const [anchor, setAnchor] = useState<PopoverAnchor | null>(null);

  const openMenu = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setAnchor({ x: e.clientX, y: e.clientY });
  };

  const handleAction = (a: MessageAction) => {
    switch (a) {
      case "edit":
        onEdit?.(m);
        break;
      case "delete":
        onDelete?.(m);
        break;
      default:
        console.log("[msg-action]", a, m.id);
    }
  };

  return (
    <div
      className={cn(
        "wh-msg",
        isMe ? "wh-msg--me" : "wh-msg--them",
        groupWithNext && "wh-msg--grouped",
        anchor && "wh-msg--menu-open",
      )}
    >
      {!isMe && (
        <div className="wh-msg-avatar">
          {showAvatar && <Avatar size={28} name={senderName} seed={m.sender?.id ?? convo.id} />}
        </div>
      )}
      <div className="wh-msg-col">
        {showWho && <div className="wh-msg-who">{senderName}</div>}
        <div className="wh-bubble-wrap" onContextMenu={openMenu}>
          <div
            className={cn(
              "wh-bubble",
              isMe && "wh-bubble--me",
              groupWithPrev && "wh-bubble--cont-top",
              groupWithNext && "wh-bubble--cont-bot",
            )}
          >
            <span className="wh-bubble-text">{m.content ?? ""}</span>
          </div>
          <MessageActions
            isMe={isMe}
            anchor={anchor}
            onClose={() => setAnchor(null)}
            onAction={handleAction}
          />
        </div>
        {!groupWithNext && (
          <div className="wh-msg-meta">
            <span>{formatTime(m.createdAt)}</span>
            {edited && <span className="wh-msg-edited">· edited</span>}
            {isMe && <Icon name="doubleCheck" size={12} />}
          </div>
        )}
      </div>
    </div>
  );
};
