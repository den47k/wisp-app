import { Avatar } from "@chat/ui";
import type { ChatConversation } from "../../types";

export const TypingIndicator = ({ conversation }: { conversation: ChatConversation }) => (
  <div className="wh-msg wh-msg--them">
    <div className="wh-msg-avatar">
      <Avatar gradientIdx={conversation.avatarIdx} size={28} name={conversation.name} />
    </div>
    <div className="wh-bubble wh-bubble--typing">
      <span />
      <span />
      <span />
    </div>
  </div>
);
