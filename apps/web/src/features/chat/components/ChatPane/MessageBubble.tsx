import { Avatar, Icon, cn } from "@chat/ui";
import type { ChatConversation, ChatMessage } from "../../types";

interface Props {
  message: ChatMessage;
  prev?: ChatMessage;
  next?: ChatMessage;
  conversation: ChatConversation;
}

export const MessageBubble = ({ message: m, prev, next, conversation: convo }: Props) => {
  const isMe = m.from === "me";
  const groupWithPrev = !!prev && prev.from === m.from && prev.who === m.who;
  const groupWithNext = !!next && next.from === m.from && next.who === m.who;
  const showAvatar = !isMe && !groupWithNext && !!convo.group;
  const showWho = !isMe && !!convo.group && !groupWithPrev;

  return (
    <div
      className={cn(
        "wh-msg",
        isMe ? "wh-msg--me" : "wh-msg--them",
        groupWithNext && "wh-msg--grouped",
      )}
    >
      {!isMe && (
        <div className="wh-msg-avatar">
          {showAvatar && (
            <Avatar
              gradientIdx={convo.avatarIdx}
              size={28}
              name={m.who || convo.name}
            />
          )}
        </div>
      )}
      <div className="wh-msg-col">
        {showWho && <div className="wh-msg-who">{m.who}</div>}
        <div
          className={cn(
            "wh-bubble",
            isMe && "wh-bubble--me",
            groupWithPrev && "wh-bubble--cont-top",
            groupWithNext && "wh-bubble--cont-bot",
          )}
        >
          {m.text}
        </div>
        {m.reactions && (
          <div className="wh-reactions">
            {m.reactions.map((r, i) => (
              <span key={i} className="wh-reaction">
                {r.emoji} {r.count}
              </span>
            ))}
          </div>
        )}
        {!groupWithNext && (
          <div className="wh-msg-meta">
            <span>{m.at}</span>
            {isMe && <Icon name="doubleCheck" size={12} />}
          </div>
        )}
      </div>
    </div>
  );
};
