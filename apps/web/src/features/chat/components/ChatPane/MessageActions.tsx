import { Icon, Popover, type PopoverAnchor } from "@chat/ui";

export type MessageAction =
  | "reply"
  | "copy"
  | "forward"
  | "pin"
  | "edit"
  | "delete"
  | "report";

interface Props {
  isMe: boolean;
  anchor: PopoverAnchor | null;
  onClose: () => void;
  onAction: (a: MessageAction) => void;
}

export const MessageActions = ({ isMe, anchor, onClose, onAction }: Props) => {
  const act = (a: MessageAction) => {
    onAction(a);
    onClose();
  };

  return (
    <Popover anchor={anchor} onClose={onClose} className="wh-ma-ctx" role="menu">
      <div className="wh-ma-ctx-list">
        <button onClick={() => act("reply")}>
          <Icon name="reply" size={13} /> <span>Reply</span>
          <span className="wh-ma-k">R</span>
        </button>
        <button onClick={() => act("copy")}>
          <Icon name="copy" size={13} /> <span>Copy text</span>
          <span className="wh-ma-k">⌘C</span>
        </button>
        <button onClick={() => act("forward")}>
          <Icon name="forward" size={13} /> <span>Forward…</span>
        </button>
        <button onClick={() => act("pin")}>
          <Icon name="pin" size={13} /> <span>Pin to chat</span>
        </button>
        {isMe && (
          <>
            <div className="wh-ma-sep" />
            <button onClick={() => act("edit")}>
              <Icon name="edit" size={13} /> <span>Edit message</span>
              <span className="wh-ma-k">E</span>
            </button>
            <button className="wh-ma-danger" onClick={() => act("delete")}>
              <Icon name="trash" size={13} /> <span>Delete…</span>
            </button>
          </>
        )}
        {!isMe && (
          <>
            <div className="wh-ma-sep" />
            <button className="wh-ma-danger" onClick={() => act("report")}>
              <Icon name="flag" size={13} /> <span>Report message</span>
            </button>
          </>
        )}
      </div>
    </Popover>
  );
};
