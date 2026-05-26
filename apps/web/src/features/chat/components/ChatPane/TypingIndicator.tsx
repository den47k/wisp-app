import { Avatar } from "@chat/ui";
import type { Conversation } from "@chat/domain";

export const TypingIndicator = ({ conversation }: { conversation: Conversation }) => (
  <div className="wh-msg wh-msg--them">
    <div className="wh-msg-avatar">
      <Avatar size={28} name={conversation.title ?? ""} seed={conversation.id} />
    </div>
    <div className="wh-bubble wh-bubble--typing">
      <span />
      <span />
      <span />
    </div>
  </div>
);
