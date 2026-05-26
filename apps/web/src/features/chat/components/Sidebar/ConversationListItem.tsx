import { Avatar, Badge, cn } from "@chat/ui";
import type { Conversation } from "@chat/domain";
import { formatRelative } from "../../utils/time";

interface Props {
  conversation: Conversation;
  active: boolean;
  onSelect: () => void;
}

export const ConversationListItem = ({ conversation: c, active, onSelect }: Props) => {
  const title = c.title ?? "Untitled";
  const last = c.lastMessage?.content ?? "";
  const timeIso = c.lastMessage?.createdAt ?? c.updatedAt;
  const isGroup = c.type === "group";

  return (
    <button type="button" className={cn("wh-convo", active && "is-active")} onClick={onSelect}>
      <Avatar size={38} name={title} seed={c.id} group={isGroup} />
      <div className="wh-convo-body">
        <div className="wh-convo-top">
          <span className="wh-convo-name">{title}</span>
          <span className="wh-convo-time">{formatRelative(timeIso)}</span>
        </div>
        <div className="wh-convo-bot">
          <span className="wh-convo-last">{last}</span>
          {c.hasUnread && <Badge>•</Badge>}
        </div>
      </div>
    </button>
  );
};
