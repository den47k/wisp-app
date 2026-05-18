import { Avatar, Badge, cn } from "@chat/ui";
import type { ChatConversation } from "../../types";

interface Props {
  conversation: ChatConversation;
  active: boolean;
  onSelect: () => void;
}

export const ConversationListItem = ({ conversation: c, active, onSelect }: Props) => (
  <button type="button" className={cn("wh-convo", active && "is-active")} onClick={onSelect}>
    <Avatar
      gradientIdx={c.avatarIdx}
      size={38}
      name={c.name}
      online={c.online}
      group={c.group}
    />
    <div className="wh-convo-body">
      <div className="wh-convo-top">
        <span className="wh-convo-name">{c.name}</span>
        <span className="wh-convo-time">{c.lastAt}</span>
      </div>
      <div className="wh-convo-bot">
        <span className="wh-convo-last">{c.last}</span>
        {c.unread > 0 && <Badge>{c.unread}</Badge>}
      </div>
    </div>
  </button>
);
